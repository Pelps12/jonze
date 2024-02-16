import { superValidate } from 'sveltekit-superforms/server';
import type { Actions, PageServerLoad } from './$types';
import { eventCreationSchema, eventUpdationSchema } from './schema';
import { fail, redirect } from '@sveltejs/kit';
import db from '$lib/server/drizzle/db';
import schema from '$lib/server/drizzle/schema';
import { eq } from 'drizzle-orm';

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
		const newEvent = await db.insert(schema.event).values({
			start: new Date(form.data.start),
			end: new Date(form.data.end),
			image: form.data.image,
			description: form.data.description,
			orgId: event.params.id,
			name: form.data.name
		});
		if (newEvent) {
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
				name: form.data.name
			})
			.where(eq(schema.event.id, form.data.id));
		if (newEvent) {
			redirect(302, event.url);
		}

		return {
			form
		};
	}
};
