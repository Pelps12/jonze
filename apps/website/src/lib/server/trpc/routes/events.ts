import { adminProcedure, procedure, router } from '..';
import db from '$lib/server/db';
import {
	and,
	eq,
	gte,
	lte,
	like,
	arrayContains,
	sql,
	asc,
	desc,
	type Member,
	type FormResponse,
	type User,
	ilike,
	not,
	getTableColumns,
	count,
	type OrgForm,
	type EventTag,
	type Event,
	isNotNull,
	inArray
} from '@repo/db';
import schema from '@repo/db/schema';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { eventCreationSchema, eventUpdationSchema } from '$lib/formSchema/event';
import { dummyClient } from '$lib/server/posthog';
import { newId } from '@repo/db/utils/createId';
import svix from '$lib/server/svix';

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export const eventRouter = router({
	getEvents: adminProcedure
		.input(
			z.object({
				name: z.string().nullish(),
				tag: z.string().nullish()
			})
		)
		.query(async ({ input }) => {
			const name = input.name;
			const tag = input.tag;

			const availableForms = await db.query.organizationForm.findMany({
				where: and(
					eq(schema.organizationForm.orgId, input.orgId),
					not(eq(schema.organizationForm.name, 'User Info'))
				),
				columns: {
					id: true,
					name: true
				}
			});

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
						eq(schema.event.orgId, input.orgId),
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
				acc.push({
					...event,
					tags: eventTag,
					form: eventForm,
					attendanceCount: row.AttendanceCount
				});
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
		}),
	createEvent: adminProcedure.input(eventCreationSchema).mutation(async ({ input, ctx }) => {
		const eventId = newId('event');
		const [newEvent] = await db
			.insert(schema.event)
			.values({
				id: eventId,
				start: input.start,
				end: input.end,
				image: input.image,
				description: input.description,
				orgId: input.orgId,
				name: input.name,
				formId: input.formId
			})
			.returning();

		if (input.tags.length > 0) {
			await db
				.insert(schema.eventTag)
				.values({ id: newEvent.id, names: input.tags })
				.onConflictDoUpdate({
					target: schema.eventTag.id,
					set: { names: input.tags }
				});
		}
		const useragent = ctx.event.request.headers.get('user-agent');
		ctx.event.locals.user &&
			dummyClient.capture({
				distinctId: ctx.event.locals.user.id,
				event: 'event created',
				properties: {
					$ip: ctx.event.getClientAddress(),
					eventId: eventId,
					orgId: input.orgId,
					name: input.name,
					...(useragent && { $useragent: useragent })
				}
			});
		if (newEvent) {
			ctx.event.platform?.context.waitUntil(
				Promise.all([
					svix.message.create(input.orgId, {
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
			return {
				success: true
			};
		}

		return {};
	}),

	updateEvent: adminProcedure.input(eventUpdationSchema).mutation(async ({ input, ctx }) => {
		const tags = input.tags;
		const [newEvent] = await db
			.update(schema.event)
			.set({
				start: input.start,
				end: input.end,
				image: input.image,
				description: input.description,
				formId: input.formId,
				orgId: input.orgId,
				name: input.name,
				updatedAt: new Date()
			})
			.where(eq(schema.event.id, input.id))
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

		const useragent = ctx.event.request.headers.get('user-agent');
		ctx.event.locals.user &&
			dummyClient.capture({
				distinctId: ctx.event.locals.user.id,
				event: 'event updated',
				properties: {
					$ip: ctx.event.getClientAddress(),
					eventId: input.id,
					orgId: input.orgId,
					name: input.name,
					...(useragent && { $useragent: useragent })
				}
			});
		if (newEvent) {
			ctx.event.platform?.context.waitUntil(
				Promise.all([
					svix.message.create(input.orgId, {
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
			return;
		}

		return;
	}),

	deleteEvent: adminProcedure
		.input(z.object({ eventId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const dbEvent = await db.query.event.findFirst({
				where: and(eq(schema.event.id, input.eventId), eq(schema.event.orgId, input.orgId)),
				with: {
					attendances: {
						where: isNotNull(schema.attendance.responseId)
					}
				}
			});

			if (!dbEvent) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Event not found'
				});
			}

			const formResponseIds = dbEvent.attendances
				.filter((attendance) => !!attendance.responseId)
				.map((attendance) => attendance.responseId as string);

			if (formResponseIds.length > 0) {
				const deletedResponse = await db
					.delete(schema.formResponse)
					.where(inArray(schema.formResponse.id, formResponseIds));
			}

			await db.delete(schema.event).where(eq(schema.event.id, input.eventId));

			return {};
		}),
	getEventDetails: procedure
		.input(
			z.object({
				orgId: z.string(),
				eventId: z.string()
			})
		)
		.query(async ({ input }) => {
			const event = await db.query.event.findFirst({
				where: and(eq(schema.event.id, input.eventId), eq(schema.event.orgId, input.orgId)),
				with: {
					attendances: {
						with: {
							member: {
								with: {
									user: {
										columns: {
											id: true,
											firstName: true,
											lastName: true,
											email: true,
											emailVerified: true,
											profilePictureUrl: true
										}
									}
								}
							},
							response: true
						},
						orderBy: (atnd, { desc }) => [desc(atnd.createdAt)]
					},
					form: true
				}
			});

			if (!event) {
				throw new TRPCError({
					message: 'Event not Found',
					code: 'NOT_FOUND'
				});
			}

			return { event };
		})
});
