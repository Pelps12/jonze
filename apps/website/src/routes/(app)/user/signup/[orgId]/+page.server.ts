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

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const orgId = params.orgId;
	const callbackUrl = url.searchParams.get('callbackUrl');
	const orgForm = await db.query.organizationForm.findFirst({
		where: and(
			eq(schema.organizationForm.orgId, orgId),
			eq(schema.organizationForm.name, 'User Info')
		)
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
		if (signupForm && member.additionalInfo) {
			redirect(302, callbackUrl ?? `/org/${orgId}`);
		}
	}
	if (!orgForm) {
		error(404, 'Org Not Found');
	}
	return {
		form: orgForm.form,
		formName: orgForm.name,
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
			if (!objectsHaveSameKeys(userResponse.additionalFields, orgForm.form)) {
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

		let responseId = null;
		if (orgForm) {
			responseId = newId('response');
			const insertResult = await db.insert(schema.formResponse).values({
				id: responseId,
				formId: orgForm.id,
				response: userResponse.additionalFields,
				memId: locals.user.id
			});
			console.log(insertResult);
		}

		//Create membership in WorkOS
		const om = await workos.userManagement.createOrganizationMembership({
			organizationId: orgId,
			userId: locals.user.id
		});

		//Add user to our database
		await db
			.insert(schema.member)
			.values({
				id: om.id,
				orgId: om.organizationId,
				userId: om.userId,
				role: 'MEMBER',
				additionalInfoId: responseId
			})
			.onDuplicateKeyUpdate({
				set: {
					orgId: om.organizationId,
					userId: om.userId,
					role: 'MEMBER',
					additionalInfoId: responseId,
					updatedAt: new Date()
				}
			});

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

		platform?.context.waitUntil(dummyClient.flushAsync());

		redirect(302, callbackUrl ?? '/');
	}
};
