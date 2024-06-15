import db from '$lib/server/db';
import schema from '@repo/db/schema';
import type { Actions, PageServerLoad } from './$types';
import { and, eq, not } from '@repo/db';
import { error, fail, redirect } from '@sveltejs/kit';
import { newId } from '@repo/db/utils/createId';
import { objectsHaveSameKeys } from '$lib/server/helpers';
import { dummyClient } from '$lib/server/posthog';
import svix from '$lib/server/svix';

export const load: PageServerLoad = async ({ parent, url, locals, params }) => {
	const form = await db.query.organizationForm.findFirst({
		where: eq(schema.organizationForm.id, params.id),

		with: {
			organization: {
				columns: {
					logo: true,
					name: true
				}
			}
		}
	});

	if (!form) error(404, 'Form Not Found');

	if (form.name === 'User Info') error(403, 'This is a restricted form');
	if (!locals.user) {
		redirect(302, `/user/signup/${form.orgId}?callbackUrl=${url.toString()}`);
	}

	return { user: locals.user, form };
};

export const actions: Actions = {
	default: async ({ request, locals, params, url, getClientAddress, platform }) => {
		const callbackUrl = url.searchParams.get('callbackUrl');

		if (!params.id) error(400, 'Event ID Required');
		const form = await db.query.organizationForm.findFirst({
			where: eq(schema.organizationForm.id, params.id)
		});
		if (!form) error(404, 'Form not found');
		if (!locals.user) {
			redirect(302, `/user/signup/${form?.orgId}?callbackUrl=${url.toString()}`);
		}

		const member = await db.query.member.findFirst({
			where: and(eq(schema.member.userId, locals.user.id), eq(schema.member.orgId, form.orgId)),
			columns: {
				id: true
			}
		});
		if (!member) {
			redirect(302, `/user/signup/${form?.orgId}?callbackUrl=${url.toString()}`);
		}

		const formData = await request.formData();
		for (const pair of formData.entries()) {
			console.log(pair[0] + ', ' + pair[1]);
		}

		let responseId = newId('response');

		const userResponseArray = Array.from(formData.entries()).filter(
			(val) => typeof val[1] === 'string'
		) as [string, string][];

		type response = {
			additionalFields: Record<string, string>;
		};

		console.log(userResponseArray);

		const userResponse = userResponseArray.reduce<response>(
			(acc, [key, value]) => {
				if (key !== 'firstName' && key !== 'lastName') {
					acc['additionalFields'][key] = value;
				}
				return acc;
			},
			{
				additionalFields: {}
			}
		);
		console.log(userResponse);

		if (
			!objectsHaveSameKeys(
				userResponse.additionalFields,
				form.form.reduce((o, key) => ({ ...o, [key.label]: 'OOP' }), {})
			)
		) {
			return fail(400);
		}

		console.log(userResponse.additionalFields);

		const [formResponse] = await db
			.insert(schema.formResponse)
			.values({
				id: responseId,
				response: Object.keys(userResponse.additionalFields).map((key) => ({
					label: key,
					response: userResponse.additionalFields[key]
				})) as any,
				formId: form.id,
				memId: member.id
			})
			.returning();

		dummyClient.capture({
			distinctId: locals.user.id,
			event: 'Form Filled',
			properties: {
				$ip: getClientAddress(),
				form: form.id,
				orgId: form.orgId
			}
		});

		platform?.context.waitUntil(
			Promise.all([
				dummyClient.flushAsync(),
				svix.message.create(params.id, {
					eventType: 'form.filled',
					payload: {
						type: 'form.filled',
						data: {
							...formResponse
						}
					}
				})
			])
		);
		redirect(302, callbackUrl ?? '/');
	}
};
