import { fail, type Actions, redirect, error } from '@sveltejs/kit';
import db from '$lib/server/db';
import { and, eq } from 'drizzle-orm';
import schema from '@repo/db/schema';
import workos, { clientId } from '$lib/server/workos';
import { WORKOS_REDIRECT_URI } from '$env/static/private';
import { newId } from '@repo/db/utils/createId';
import { objectsHaveSameKeys } from '$lib/server/helpers';
import type { PageServerLoad } from './$types';
import posthog, { dummyClient } from '$lib/server/posthog';
import svix from '$lib/server/svix';

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
		const loginUrl = workos.userManagement.getAuthorizationUrl({
			// Specify that we'd like AuthKit to handle the authentication flow
			provider: 'authkit',
			state: url.toString(),
			// The callback endpoint that WorkOS will redirect to after a user authenticates
			redirectUri: `${WORKOS_REDIRECT_URI}`,
			clientId
		});
		console.log(`${WORKOS_REDIRECT_URI}`);
		redirect(302, loginUrl);
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
					}
				}
			}
		});
		const signupForm = member?.organization.forms[0];
		if (
			(signupForm && member.additionalInfoId) ||
			(member && member.organization.forms.length == 0)
		) {
			redirect(302, callbackUrl ?? `/org/${orgId}`);
		}
	}
	if (!org) {
		error(404, 'Org Not Found');
	}

	return {
		form: org.forms[0],
		formName: org.forms[0]?.name,
		defaultFields: {
			firstName: locals.user.firstName,
			lastName: locals.user.lastName
		}
	};
};

export const actions: Actions = {
	default: async ({ request, locals, url, params, getClientAddress, platform }) => {
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
			)
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
				if (key !== 'firstName' && key !== 'lastName') {
					acc['additionalFields'][key] = value;
				} else {
					acc['defaultFields'][key] = value;
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
				userId: locals.user.id
			});
		}

		//Create membership in WorkOS
		const om = await workos.userManagement.createOrganizationMembership({
			organizationId: orgId,
			userId: locals.user.id
		});

		let responseId = null;
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
		}

		const defaultPlan = await db.query.plan.findFirst({
			where: and(eq(schema.plan.orgId, orgId), eq(schema.plan.name, 'Default Plan')),
			columns: {
				id: true
			}
		});

		//Add user to our database
		const [result] = await db
			.insert(schema.member)
			.values({
				id: om.id,
				orgId: om.organizationId,
				userId: om.userId,
				role: 'MEMBER',
				additionalInfoId: responseId
			})
			.returning()
			.onConflictDoUpdate({
				target: schema.member.id,
				set: {
					orgId: om.organizationId,
					userId: om.userId,
					additionalInfoId: responseId,
					updatedAt: new Date()
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
				dummyClient.flushAsync(),
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

		redirect(302, callbackUrl ?? '/');
	}
};
