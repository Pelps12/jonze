import db from '$lib/server/db';
import { and, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import schema from '@repo/db/schema';
import { error, redirect, type Actions, fail } from '@sveltejs/kit';
import { objectsHaveSameKeys } from '$lib/server/helpers';
import { newId } from '@repo/db/utils/createId';
import posthog, { dummyClient } from '$lib/server/posthog';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const event = await db.query.event.findFirst({
		where: eq(schema.event.id, params.id),
		with: {
			form: true,
			organization: {
				columns: {
					name: true,
					logo: true
				}
			}
		}
	});

	if (!event) error(404, 'Event not found');

	if (!locals.user) {
		redirect(302, `/user/signup/${event?.orgId}?callbackUrl=${url.toString()}`);
	}

	const member = await db.query.member.findFirst({
		where: and(eq(schema.member.userId, locals.user.id), eq(schema.member.orgId, event.orgId)),
		columns: {
			id: true,
			additionalInfoId: true
		},
		with: {
			attendances: {
				where: eq(schema.attendance.eventId, event.id)
			},
			organization: {
				with: {
					forms: {
						where: eq(schema.organizationForm.name, 'User Info')
					}
				}
			}
		}
	});
	console.log(member);

	if (!member || (member.organization.forms.length > 0 && !member.additionalInfoId)) {
		redirect(302, `/user/signup/${event?.orgId}?callbackUrl=${url.toString()}`);
	}

	return { event, user: locals.user, formFilled: member && member.attendances.length > 0 };
};

export const actions: Actions = {
	default: async ({ request, locals, params, url, getClientAddress, platform }) => {
		const callbackUrl = url.searchParams.get('callbackUrl');

		if (!params.id) error(400, 'Event ID Required');
		const event = await db.query.event.findFirst({
			where: eq(schema.event.id, params.id),
			with: {
				form: true
			}
		});
		if (!event) error(404, 'Event not found');
		if (!locals.user) {
			redirect(302, `/user/signup/${event?.orgId}?callbackUrl=${url.toString()}`);
		}

		const member = await db.query.member.findFirst({
			where: and(eq(schema.member.userId, locals.user.id), eq(schema.member.orgId, event.orgId)),
			columns: {
				id: true
			},
			with: {
				attendances: {
					where: eq(schema.attendance.eventId, event.id)
				}
			}
		});
		if (!member) {
			redirect(302, `/user/signup/${event?.orgId}?callbackUrl=${url.toString()}`);
		}

		if (member && member.attendances.length > 0) {
			url.searchParams.set('filled', 'filled');
			return;
		}

		const formData = await request.formData();
		for (const pair of formData.entries()) {
			console.log(pair[0] + ', ' + pair[1]);
		}

		let responseId = null;

		if (event.formId && event.form) {
			responseId = newId('response');

			const userResponseArray = Array.from(formData.entries()).filter(
				(val) => typeof val[1] === 'string'
			) as [string, string][];

			type response = {
				additionalFields: Record<string, string>;
			};

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

			if (
				!objectsHaveSameKeys(
					userResponse.additionalFields,
					event.form.form.reduce((o, key) => ({ ...o, [key.label]: 'OOP' }), {})
				)
			) {
				return fail(400);
			}

			await db.insert(schema.formResponse).values({
				id: responseId,
				response: Object.keys(userResponse.additionalFields).map((key) => ({
					label: key,
					response: userResponse.additionalFields[key]
				})) as any,
				formId: event.formId,
				memId: member.id
			});
		}

		await db.insert(schema.attendance).values({
			responseId: responseId,
			memId: member.id,
			eventId: event.id
		});

		dummyClient.capture({
			distinctId: locals.user.id,
			event: 'attendance marked',
			properties: {
				$ip: getClientAddress(),
				eventId: event.id,
				orgId: event.orgId
			}
		});

		platform?.context.waitUntil(dummyClient.flushAsync());
		redirect(302, callbackUrl ?? '/');
	}
};
