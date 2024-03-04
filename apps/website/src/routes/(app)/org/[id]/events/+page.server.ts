import { superValidate } from 'sveltekit-superforms/server';
import type { Actions, PageServerLoad } from './$types';
import { eventCreationSchema, eventUpdationSchema } from './schema';
import { error, fail, redirect } from '@sveltejs/kit';
import db from '$lib/server/db';
import schema from '@repo/db/schema';
import { eq, and, not } from 'drizzle-orm';
import { parseZonedDateTime } from '@internationalized/date';
import posthog, { dummyClient } from '$lib/server/posthog';
import { newId } from '@repo/db/utils/createId';
import { zod } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async ({ params }) => {
	const events = await db.query.event.findMany({
		where: eq(schema.event.orgId, params.id),
		orderBy: (events, { desc }) => [desc(events.start)],
		with: {
			form: true
		}
	});

	const availableForms = db.query.organizationForm.findMany({
		where: and(
			eq(schema.organizationForm.orgId, params.id),
			not(eq(schema.organizationForm.name, 'User Info'))
		),
		columns: {
			id: true,
			name: true
		}
	});
	console.log(events);
	return {
		events,
		form: await superValidate(zod(eventCreationSchema)),
		updateForms: await Promise.all(
			events.map((event) =>
				superValidate(
					{
						id: event.id,
						name: event.name,
						description: event.description,
						start: event.start,
						end: event.end,
						image: event.image,
						formId: event.formId
					},
					zod(eventUpdationSchema),
					{
						id: event.id
					}
				)
			)
		),
		forms: availableForms
	};
};

export const actions: Actions = {
	create: async (event) => {
		const form = await superValidate(event, zod(eventCreationSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		console.log(form.data);

		const eventId = newId('event');
		const newEvent = await db.insert(schema.event).values({
			id: eventId,
			start: form.data.start,
			end: form.data.end,
			image: form.data.image,
			description: form.data.description,
			orgId: event.params.id,
			name: form.data.name,
			formId: form.data.formId
		});
		const useragent = event.request.headers.get('user-agent');
		event.locals.user &&
			dummyClient.capture({
				distinctId: event.locals.user.id,
				event: 'event created',
				properties: {
					$ip: event.getClientAddress(),
					eventId: eventId,
					orgId: event.params.id,
					name: form.data.name,
					...(useragent && { $useragent: useragent })
				}
			});
		if (newEvent) {
			event.platform?.context.waitUntil(dummyClient.flushAsync());
			redirect(302, event.url);
		}

		return {
			form
		};
	},
	update: async (event) => {
		const form = await superValidate(event, zod(eventUpdationSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		console.log(form.data, 'Update Data');
		const newEvent = await db
			.update(schema.event)
			.set({
				start: form.data.start,
				end: form.data.end,
				image: form.data.image,
				description: form.data.description,
				formId: form.data.formId,
				orgId: event.params.id,
				name: form.data.name,
				updatedAt: new Date()
			})
			.where(eq(schema.event.id, form.data.id));

		//Capture event updated

		const useragent = event.request.headers.get('user-agent');
		event.locals.user &&
			dummyClient.capture({
				distinctId: event.locals.user.id,
				event: 'event updated',
				properties: {
					$ip: event.getClientAddress(),
					eventId: form.data.id,
					orgId: event.params.id,
					name: form.data.name,
					...(useragent && { $useragent: useragent })
				}
			});
		if (newEvent) {
			event.platform?.context.waitUntil(dummyClient.flushAsync());
			redirect(302, event.url);
		}

		return {
			form
		};
	}
};
