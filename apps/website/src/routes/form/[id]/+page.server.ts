import db from '$lib/server/db';
import schema from '@repo/db/schema';
import type { Actions, PageServerLoad } from './$types';
import { and, eq, not } from '@repo/db';
import { error, fail, redirect } from '@sveltejs/kit';
import { newId } from '@repo/db/utils/createId';
import { objectsHaveSameKeys } from '$lib/server/helpers';
import client, { dummyClient } from '$lib/server/posthog';
import svix from '$lib/server/svix';
import { PUBLIC_ENVIRONMENT, PUBLIC_URL } from '$env/static/public';
import { superValidate } from 'sveltekit-superforms';
import { createDynamicSchema, type CustomForm } from '@repo/form-validation';
import { zod } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async ({ parent, url, locals, params }) => {
	const form = await db.query.organizationForm.findFirst({
		where: eq(schema.organizationForm.id, params.id),

		with: {
			organization: {
				columns: {
					logo: true,
					name: true,
					website: true,
					plan: true
				}
			}
		}
	});

	if (!form) error(404, 'Form Not Found');

	if (form.name === 'User Info') error(403, 'This is a restricted form');
	if (!locals.user) {
		redirect(302, `/user/signup/${form.orgId}?callbackUrl=${url.toString()}`);
	}

	const isFeatureFlagEnabled = await client.isFeatureEnabled(
		'flag-key',
		'distinct_id_of_your_user'
	);
	const modifiedForm: CustomForm = form.form.map((element) => {
		if ((element.type === 'textarea' || element.type === 'text') && !element.validator) {
			return {
				...element,
				validator: {
					required: true,
					minLength: 2
				}
			};
		}

		return { ...element };
	});

	return {
		user: locals.user,
		form,
		modifiedForm,
		zodForm: await superValidate(zod(createDynamicSchema(modifiedForm)))
	};
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

		const isFeatureFlagEnabled =
			PUBLIC_ENVIRONMENT === 'dev' ||
			(await client.isFeatureEnabled('new-form-validation', locals.user.id));

		const member = await db.query.member.findFirst({
			where: and(eq(schema.member.userId, locals.user.id), eq(schema.member.orgId, form.orgId)),
			columns: {
				id: true
			},
			with: {
				organization: {
					columns: {
						website: true
					}
				}
			}
		});
		if (!member) {
			redirect(302, `/user/signup/${form?.orgId}?callbackUrl=${url.toString()}`);
		}

		let response: {
			label: string;
			id: number;
			response: string;
		}[];

		let responseId = newId('response');

		if (isFeatureFlagEnabled) {
			const dynamicSchema = createDynamicSchema(form.form);
			const zodForm = await superValidate(
				{
					request
				},
				zod(dynamicSchema)
			);
			if (!zodForm.valid) {
				return fail(400, {
					form
				});
			}

			response = form.form.map((field) => ({
				id: field.id,
				label: field.label,
				response: zodForm.data[field.id]
			}));
		} else {
			const formData = await request.formData();
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

			response = Object.keys(userResponse.additionalFields).map((key, idx) => ({
				id: idx,
				label: key,
				response: userResponse.additionalFields[key]
			})) as any;
		}

		const [formResponse] = await db
			.insert(schema.formResponse)
			.values({
				id: responseId,
				response,
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
				svix.message.create(form.orgId, {
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
		const orgHomePage = member.organization.website;
		const returnUrl = new URL(callbackUrl ?? orgHomePage ?? PUBLIC_URL);
		redirect(302, returnUrl);
	}
};
