import { superValidate } from 'sveltekit-superforms/server';
import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import db from '$lib/server/db';
import schema from '@repo/db/schema';
import {
	eq,
	and,
	not,
	inArray,
	isNotNull,
	desc,
	ilike,
	type OrgForm,
	type EventTag,
	type Event,
	arrayContains,
	getTableColumns,
	count
} from '@repo/db';
import { dummyClient } from '$lib/server/posthog';
import { newId } from '@repo/db/utils/createId';
import { zod } from 'sveltekit-superforms/adapters';
import svix from '$lib/server/svix';
import { eventCreationSchema, eventUpdationSchema } from '$lib/formSchema/event';

/* export const load: PageServerLoad = async ({ params, url }) => {
	const name = url.searchParams.get('name');
	const tag = url.searchParams.get('tag');

	const availableForms = Promise.resolve(
		await db.query.organizationForm.findMany({
			where: and(
				eq(schema.organizationForm.orgId, params.id),
				not(eq(schema.organizationForm.name, 'User Info'))
			),
			columns: {
				id: true,
				name: true
			}
		})
	);

	let query = db
		.select({
			Event: getTableColumns(schema.event),
			EventTag: getTableColumns(schema.eventTag),
			OrganizationForm: getTableColumns(schema.organizationForm),
			AttendanceCount: count(schema.attendance.id)
		})
		.from(schema.event)
		.leftJoin(schema.organizationForm, eq(schema.organizationForm.id, schema.event.formId))
		.leftJoin(schema.eventTag, eq(schema.eventTag.id, schema.event.id))
		.leftJoin(schema.attendance, eq(schema.attendance.eventId, schema.event.id))
		.where(
			and(
				eq(schema.event.orgId, params.id),
				name ? ilike(schema.event.name, `%${name}%`) : undefined,
				tag ? arrayContains(schema.eventTag.names, [tag]) : undefined
			)
		)
		.orderBy(desc(schema.event.start))
		.groupBy((t) => [t.Event.id, t.EventTag.id, t.OrganizationForm.id])
		.$dynamic();

	const events_with_join = await query;
	console.log(events_with_join.length, 'ROW COUNT');

	const result = events_with_join.reduce<
		(Event & { form: OrgForm | null; tags: EventTag | null; attendanceCount: number })[]
	>((acc, row) => {
		const event = row.Event;
		const eventTag = row.EventTag;
		const eventForm = row.OrganizationForm;
		acc.push({ ...event, tags: eventTag, form: eventForm, attendanceCount: row.AttendanceCount });
		return acc;
	}, []);

	const chartData = {
		labels: result.map((event) => event.name).reverse(),
		data: result.map((event) => event.attendanceCount).reverse()
	};

	console.log(result.map((event) => event.tags));
	return {
		events: result,
		form: await superValidate(zod(eventCreationSchema)),
		updateForms: await Promise.all(
			result.map((event) =>
				superValidate(
					{
						...event,
						tags: event.tags?.names
					},
					zod(eventUpdationSchema),
					{
						id: event.id
					}
				)
			)
		),
		forms: availableForms,
		chartData
	};
}; */

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
		const [newEvent] = await db
			.insert(schema.event)
			.values({
				id: eventId,
				start: form.data.start,
				end: form.data.end,
				image: form.data.image,
				description: form.data.description,
				orgId: event.params.id,
				name: form.data.name,
				formId: form.data.formId
			})
			.returning();

		if (form.data.tags.length > 0) {
			await db
				.insert(schema.eventTag)
				.values({ id: newEvent.id, names: form.data.tags })
				.onConflictDoUpdate({
					target: schema.eventTag.id,
					set: { names: form.data.tags }
				});
		}
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
			event.platform?.context.waitUntil(
				Promise.all([
					dummyClient.flushAsync(),
					svix.message.create(event.params.id, {
						eventType: 'event.created',
						payload: {
							type: 'event.created',
							data: {
								...newEvent
							}
						}
					})
				])
			);
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

		const tagParse = await eventUpdationSchema.shape.tags.safeParseAsync(
			JSON.parse(form.data.tags[0])
		);
		if (!tagParse.success) error(400, 'Something with the tags');

		const tags = tagParse.data;
		const [newEvent] = await db
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
			.where(eq(schema.event.id, form.data.id))
			.returning();

		if (tags.length > 0) {
			await db
				.insert(schema.eventTag)
				.values({ id: newEvent.id, names: tags })
				.onConflictDoUpdate({
					target: schema.eventTag.id,
					set: { names: tags }
				});
		}

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
			event.platform?.context.waitUntil(
				Promise.all([
					dummyClient.flushAsync(),
					svix.message.create(event.params.id, {
						eventType: 'event.updated',
						payload: {
							type: 'event.updated',
							data: {
								...newEvent
							}
						}
					})
				])
			);
			redirect(302, event.url);
		}

		return {
			form
		};
	},
	delete: async (event) => {
		const formData = await event.request.formData();
		const id = formData.get('id');
		if (typeof id !== 'string') {
			error(400, 'Some Bad Input');
		}

		const dbEvent = await db.query.event.findFirst({
			where: eq(schema.event.id, id),
			with: {
				attendances: {
					where: isNotNull(schema.attendance.responseId)
				}
			}
		});

		if (!dbEvent) {
			error(404, 'Event not found');
		}

		const formResponseIds = dbEvent.attendances
			.filter((attendance) => !!attendance.responseId)
			.map((attendance) => attendance.responseId as string);

		if (formResponseIds.length > 0) {
			const deletedResponse = await db
				.delete(schema.formResponse)
				.where(inArray(schema.formResponse.id, formResponseIds));
		}

		await db.delete(schema.event).where(eq(schema.event.id, id));

		redirect(302, event.url);
	}
};
