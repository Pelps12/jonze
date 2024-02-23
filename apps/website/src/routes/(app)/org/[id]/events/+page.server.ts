import { superValidate } from 'sveltekit-superforms/server';
import type { Actions, PageServerLoad } from './$types';
import { eventCreationSchema, eventUpdationSchema } from './schema';
import { error, fail, redirect } from '@sveltejs/kit';
import db from '$lib/server/db';
import schema from '@repo/db/schema';
import { eq } from 'drizzle-orm';
import { parseZonedDateTime } from '@internationalized/date';
import posthog from '$lib/server/posthog';
import { newId } from '@repo/db/utils/createId';

export const load: PageServerLoad = async ({ params }) => {
	const events = await db.query.event.findMany({
		where: eq(schema.event.orgId, params.id),
		orderBy: (events, { desc }) => [desc(events.start)],
		with: {
			form: true
		}
	});
	console.log(events);
	return {
		events,
		form: await superValidate(eventCreationSchema),
		updateForm: await superValidate(eventUpdationSchema, {
			id: '79j98009'
		})
	};
};

export const actions: Actions = {
	create: async (event) => {
		const form = await superValidate(event, eventCreationSchema);
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		console.log(form.data);

		const eventId = newId('event');
		const newEvent = await db.insert(schema.event).values({
			id: eventId,
			start: parseZonedDateTime(`${form.data.start}[${form.data.timezone}]`).toDate(),
			end: parseZonedDateTime(`${form.data.end}[${form.data.timezone}]`).toDate(),
			image: form.data.image,
			description: form.data.description,
			orgId: event.params.id,
			name: form.data.name
		});
		event.locals.user &&
			posthog.capture({
				distinctId: event.locals.user.id,
				event: 'event created',
				properties: {
					$ip: event.getClientAddress(),
					eventId: eventId,
					orgId: event.params.id,
					name: form.data.name
				}
			});
		if (newEvent) {
			event.platform?.context.waitUntil(posthog.shutdownAsync());
			redirect(302, event.url);
		}

		return {
			form
		};
	},
	update: async (event) => {
		const form = await superValidate(event, eventUpdationSchema);
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		console.log(form.data);
		const newEvent = await db
			.update(schema.event)
			.set({
				start: new Date(form.data.start),
				end: new Date(form.data.end),
				image: form.data.image,
				description: form.data.description,
				orgId: event.params.id,
				name: form.data.name,
				updatedAt: new Date()
			})
			.where(eq(schema.event.id, form.data.id));

		//Capture event updated
		event.locals.user &&
			posthog.capture({
				distinctId: event.locals.user.id,
				event: 'event updated',
				properties: {
					$ip: event.getClientAddress(),
					eventId: schema.event.id,
					orgId: event.params.id,
					name: form.data.name
				}
			});
		if (newEvent) {
			event.platform?.context.waitUntil(posthog.shutdownAsync());
			redirect(302, event.url);
		}

		return {
			form
		};
	}
};
