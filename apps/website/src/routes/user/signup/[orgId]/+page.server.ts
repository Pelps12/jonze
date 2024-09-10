import { fail, type Actions, redirect, error, json } from '@sveltejs/kit';
import db from '$lib/server/db';
import { and, eq } from '@repo/db';
import schema from '@repo/db/schema';
import workos, { clientId } from '$lib/server/workos';
import { WORKOS_REDIRECT_URI } from '$env/static/private';
import { newId } from '@repo/db/utils/createId';
import { objectsHaveSameKeys } from '$lib/server/helpers';
import type { PageServerLoad } from './$types';
import posthog, { dummyClient } from '$lib/server/posthog';
import svix from '$lib/server/svix';
import { PUBLIC_URL } from '$env/static/public';
import { createDynamicSchema, type CustomForm } from '@repo/form-validation';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const orgId = params.orgId;
	const callbackUrl = url.searchParams.get('callbackUrl');
	const org = await db.query.organization.findFirst({
		where: eq(schema.organization.id, orgId),
		with: {
			forms: {
				where: eq(schema.organizationForm.name, 'User Info')
			}
		}
	});

	if (!locals.user) {
		redirect(302, `/api/auth?callbackUrl=${url.toString()}`);
	}
	if (locals.user) {
		const member = await db.query.member.findFirst({
			where: and(eq(schema.member.userId, locals.user.id), eq(schema.member.orgId, orgId)),
			with: {
				additionalInfo: true,
				organization: {
					with: {
						forms: {
							where: eq(schema.organizationForm.name, 'User Info')
						}
					},
					columns: {
						website: true
					}
				}
			}
		});
		const signupForm = member?.organization.forms[0];
		const returnURL = new URL(callbackUrl ?? member?.organization.website ?? PUBLIC_URL);

		if (
			(signupForm && member.additionalInfoId) ||
			(member && member.organization.forms.length == 0)
		) {
			returnURL.searchParams.set('already_member', 'true');

			redirect(302, returnURL);
		}
	}
	if (!org) {
		error(404, 'Org Not Found');
	}

	const userInfoForm = org.forms[0];

	const mergedForm: CustomForm = [
		{
			label: 'First Name',
			id: 100001,
			type: 'text',
			placeholder: 'First Name',
			validator: {
				required: true
			}
		},
		{
			label: 'Last Name',
			id: 100002,
			type: 'text',
			placeholder: 'Last Name',
			validator: {
				required: true
			}
		},
		...(!!userInfoForm ? userInfoForm.form : [])
	];

	const dynamicSchema = createDynamicSchema(mergedForm);

	let defaultNames: Record<string, string> | undefined = {};

	//CONDITIONALLY SET NAME DEFAULTS

	if (locals.user.firstName) {
		defaultNames[100001] = locals.user.firstName;
	}

	if (locals.user.lastName) {
		defaultNames[100002] = locals.user.lastName;
	}

	if (Object.keys(defaultNames).length == 0) {
		defaultNames = undefined;
	}

	return {
		form: org.forms[0],
		defaultFields: {
			firstName: locals.user.firstName,
			lastName: locals.user.lastName
		},
		orgLogo: org.logo,
		orgName: org.name,

		mergedForm,
		zodForm: await superValidate(defaultNames, zod(dynamicSchema))
	};
};

export const actions: Actions = {
	formUpload: async ({ request, locals, url, params, getClientAddress, platform }) => {
		if (!locals.user) {
			redirect(302, '/');
		}
		const orgId = params.orgId;
		if (!orgId) {
			error(404, 'Org Not Found');
		}
		const orgForm = await db.query.organizationForm.findFirst({
			where: and(
				eq(schema.organizationForm.orgId, orgId),
				eq(schema.organizationForm.name, 'User Info')
			),
			with: {
				organization: {
					columns: {
						website: true
					}
				}
			}
		});
		const formData = await request.formData();
		for (const pair of formData.entries()) {
			console.log(pair[0] + ', ' + pair[1]);
		}

		const userResponseArray = Array.from(formData.entries()).filter(
			(val) => typeof val[1] === 'string'
		) as [string, string][];

		type response = {
			defaultFields: {
				firstName: string | null;
				lastName: string | null;
			};
			additionalFields: Record<string, string>;
		};

		const userResponse = userResponseArray.reduce<response>(
			(acc, [key, value]) => {
				if (key !== 'firstName' && key !== 'lastName' && key !== 'callbackUrl') {
					acc['additionalFields'][key] = value;
				} else {
					if (key !== 'callbackUrl') {
						acc['defaultFields'][key] = value;
					}
				}
				return acc;
			},
			{
				defaultFields: {
					firstName: locals.user.firstName,
					lastName: locals.user.lastName
				},
				additionalFields: {}
			}
		);
		console.log('userResponse', userResponse);
		if (orgForm) {
			console.log(orgForm, 'JFBFICNOCNEWIOCW');
			if (
				!objectsHaveSameKeys(
					userResponse.additionalFields,
					orgForm.form.reduce((o, key) => ({ ...o, [key.label]: 'OOP' }), {})
				)
			) {
				// Again, return { form } and things will just work.
				return fail(400);
			}
		}

		//WASTED API CALLS
		if (userResponse.defaultFields.firstName || userResponse.defaultFields.lastName) {
			await workos.userManagement.updateUser({
				userId: locals.user.id,
				firstName: userResponse.defaultFields.firstName ?? undefined,
				lastName: userResponse.defaultFields.lastName ?? undefined
			});
		}

		//Create membership in WorkOS
		const om = await workos.userManagement.createOrganizationMembership({
			organizationId: orgId,
			userId: locals.user.id
		});

		//Add user to our database
		const [result] = await db
			.insert(schema.member)
			.values({
				id: om.id,
				orgId: om.organizationId,
				userId: om.userId,
				role: 'MEMBER'
			})
			.returning()
			.onConflictDoUpdate({
				target: schema.member.id,
				set: {
					orgId: om.organizationId,
					userId: om.userId,
					updatedAt: new Date()
				}
			});

		let responseId = null;

		//If there's a form. Create a response
		if (orgForm) {
			responseId = newId('response');
			const insertResult = await db.insert(schema.formResponse).values({
				id: responseId,
				formId: orgForm.id,
				response: Object.keys(userResponse.additionalFields).map((key) => ({
					label: key,
					response: userResponse.additionalFields[key]
				})) as any,
				memId: om.id
			});
			console.log(insertResult);

			//Attach the form response to the user
			await db
				.update(schema.member)
				.set({
					additionalInfoId: responseId
				})
				.where(eq(schema.member.id, om.id));
		}

		const defaultPlan = await db.query.plan.findFirst({
			where: and(eq(schema.plan.orgId, orgId), eq(schema.plan.name, 'Default Plan')),
			columns: {
				id: true
			}
		});

		if (defaultPlan) {
			await db.insert(schema.membership).values({
				planId: defaultPlan.id,
				memId: result.id
			});
		}

		const useragent = request.headers.get('user-agent');
		dummyClient.capture({
			distinctId: locals.user.id,
			event: 'member added',
			properties: {
				$ip: getClientAddress(),
				orgId: om.organizationId,
				...(useragent && { $useragent: useragent })
			}
		});

		platform?.context.waitUntil(
			Promise.all([
				svix.message.create(orgId, {
					eventType: 'member.added',
					payload: {
						type: 'member.added',
						data: {
							...result
						}
					}
				})
			])
		);

		const orgHomePageUrl = orgForm?.organization.website;

		const returnURL = formData.get('callbackUrl')?.toString() ?? orgHomePageUrl ?? PUBLIC_URL;

		locals.logger?.info('LOG', { returnURL });

		redirect(302, returnURL);
	},
	newForm: async ({ request, locals, url, params, getClientAddress, platform }) => {
		const callbackUrl = url.searchParams.get('callbackUrl');

		if (!locals.user) {
			redirect(302, '/');
		}
		const orgId = params.orgId;
		if (!orgId) {
			error(404, 'Org Not Found');
		}
		const orgForm = await db.query.organizationForm.findFirst({
			where: and(
				eq(schema.organizationForm.orgId, orgId),
				eq(schema.organizationForm.name, 'User Info')
			),
			with: {
				organization: {
					columns: {
						website: true
					}
				}
			}
		});

		console.log('ORGFORM', orgForm);
		const userInfoForm = orgForm;

		const mergedForm: CustomForm = [
			{
				label: 'First Name',
				id: 100001,
				type: 'text',
				placeholder: 'First Name',
				validator: {
					required: true
				}
			},
			{
				label: 'Last Name',
				id: 100002,
				type: 'text',
				placeholder: 'Last Name',
				validator: {
					required: true
				}
			},
			...(!!userInfoForm ? userInfoForm.form : [])
		];
		const dynamicSchema = createDynamicSchema(mergedForm);
		const form = await superValidate({ request }, zod(dynamicSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		if (form.data[100001] || form.data[100002]) {
			await workos.userManagement.updateUser({
				userId: locals.user.id,
				firstName: form.data[100001] ?? undefined,
				lastName: form.data[100002] ?? undefined
			});
		}

		//Create membership in WorkOS
		const om = await workos.userManagement.createOrganizationMembership({
			organizationId: orgId,
			userId: locals.user.id
		});

		const [result] = await db
			.insert(schema.member)
			.values({
				id: om.id,
				orgId: om.organizationId,
				userId: om.userId,
				role: 'MEMBER'
			})
			.returning()
			.onConflictDoUpdate({
				target: schema.member.id,
				set: {
					orgId: om.organizationId,
					userId: om.userId,
					updatedAt: new Date()
				}
			});

		let responseId = null;
		if (orgForm) {
			responseId = newId('response');
			const insertResult = await db.insert(schema.formResponse).values({
				id: responseId,
				formId: orgForm.id,
				response: orgForm.form.map((field) => ({
					id: field.id,
					label: field.label,
					response: form.data[field.id]
				})),
				memId: om.id
			});

			await db
				.update(schema.member)
				.set({
					additionalInfoId: responseId
				})
				.where(eq(schema.member.id, om.id));
			console.log(insertResult);
		}

		const defaultPlan = await db.query.plan.findFirst({
			where: and(eq(schema.plan.orgId, orgId), eq(schema.plan.name, 'Default Plan')),
			columns: {
				id: true
			}
		});

		if (defaultPlan) {
			await db.insert(schema.membership).values({
				planId: defaultPlan.id,
				memId: result.id
			});
		}

		const useragent = request.headers.get('user-agent');
		dummyClient.capture({
			distinctId: locals.user.id,
			event: 'member added',
			properties: {
				$ip: getClientAddress(),
				orgId: om.organizationId,
				...(useragent && { $useragent: useragent })
			}
		});

		platform?.context.waitUntil(
			Promise.all([
				svix.message.create(orgId, {
					eventType: 'member.added',
					payload: {
						type: 'member.added',
						data: {
							...result
						}
					}
				})
			])
		);

		const orgHomePageUrl = orgForm?.organization.website;

		const returnURL = callbackUrl ?? orgHomePageUrl ?? PUBLIC_URL;

		console.log({ url: url.toString(), callbackUrl });

		locals.logger?.info('LOG', { url: url.toString(), callbackUrl });

		redirect(302, returnURL);

		return json({
			name: 'HEYYYY'
		});
	}
};
