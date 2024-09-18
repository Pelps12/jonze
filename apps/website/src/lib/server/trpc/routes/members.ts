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
	gt,
	lt,
	or
} from '@repo/db';
import schema from '@repo/db/schema';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { memberUpdationSchema, membershipCreationSchema } from '$lib/formSchema/member';
import { dummyClient } from '$lib/server/posthog';
import svix from '$lib/server/svix';
import workos from '$lib/server/workos';

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export const memberRouter = router({
	getMember: adminProcedure
		.input(
			z.object({
				memberId: z.string()
			})
		)
		.query(async ({ input }) => {
			const member = await db.query.member.findFirst({
				where: and(eq(schema.member.id, input.memberId), eq(schema.member.orgId, input.orgId)),
				with: {
					attendances: {
						with: {
							event: {
								columns: {
									id: true,
									name: true
								}
							}
						},
						orderBy: (attendance, { desc }) => [desc(attendance.createdAt)]
					},
					memberships: {
						with: {
							plan: {
								columns: {
									id: true,
									name: true
								}
							}
						},
						orderBy: (membership, { desc }) => [desc(membership.createdAt)],
						limit: 1
					},
					user: {
						columns: {
							id: true,
							firstName: true,
							lastName: true,
							profilePictureUrl: true,
							email: true
						}
					},
					tags: true
				}
			});

			const availablePlans = await db.query.plan.findMany({
				where: eq(schema.plan.orgId, input.orgId),
				columns: {
					id: true,
					name: true
				}
			});
			if (!member) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'User not Found'
				});
			}

			console.log(member);
			return {
				member,
				form: await superValidate(
					member.memberships[0]
						? {
								planId: member.memberships[0].planId,
								provider: member.memberships[0].provider
							}
						: {},
					zod(membershipCreationSchema)
				),
				memberForm: await superValidate(
					member.tags ? { tags: member.tags.names } : {},
					zod(memberUpdationSchema)
				),
				plans: availablePlans
			};
		}),
	updateMembership: adminProcedure
		.input(membershipCreationSchema.extend({ memberId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const member = await db.query.member.findFirst({
				where: eq(schema.member.id, input.memberId)
			});

			if (!member) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Member not found'
				});
			}
			const [newMembership] = await db
				.insert(schema.membership)
				.values({
					planId: input.planId,
					memId: input.memberId,
					provider: input.provider,
					...(input.createdAt ? { createdAt: input.createdAt } : {})
				})
				.returning();
			console.log(newMembership, 'MEMBERSHIP');
			//Capture event updated

			const useragent = ctx.event.request.headers.get('user-agent');
			ctx.event.locals.user &&
				dummyClient.capture({
					distinctId: ctx.event.locals.user.id,
					event: 'new user membership',
					properties: {
						$ip: ctx.event.getClientAddress(),
						planId: input.planId,
						orgId: input.orgId,
						memId: input.memberId,
						method: 'manual',
						id: newMembership.id,
						...(useragent && { $useragent: useragent })
					}
				});
			if (newMembership) {
				ctx.event.platform?.context.waitUntil(
					Promise.all([
						svix.message.create(input.orgId, {
							eventType: 'membership.updated',
							payload: {
								type: 'membership.updated',
								data: {
									...{ ...newMembership, member }
								}
							}
						})
					])
				);
				return {};
			}

			return {};
		}),

	updateMember: adminProcedure
		.input(memberUpdationSchema.extend({ memberId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const member = await db.query.member.findFirst({
				where: eq(schema.member.id, input.memberId),
				with: {
					user: {
						columns: {
							id: true,
							firstName: true,
							lastName: true,
							email: true,
							profilePictureUrl: true
						}
					},
					tags: true,
					additionalInfo: true
				}
			});

			if (!member) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Member not found'
				});
			}
			let optimisticMember: typeof member = member;
			if (input.tags.length > 0) {
				const [memberTags] = await db
					.insert(schema.memberTag)
					.values({ id: member.id, names: input.tags })
					.onConflictDoUpdate({
						target: schema.memberTag.id,
						set: { names: input.tags }
					})
					.returning();
				optimisticMember = { ...optimisticMember, tags: memberTags };
			}

			const useragent = ctx.event.request.headers.get('user-agent');
			ctx.event.locals.user &&
				dummyClient.capture({
					distinctId: ctx.event.locals.user.id,
					event: 'new user tags',
					properties: {
						$ip: ctx.event.getClientAddress(),
						orgId: input.orgId,
						memId: input.memberId,
						...(useragent && { $useragent: useragent })
					}
				});

			ctx.event.platform?.context.waitUntil(
				Promise.all([
					svix.message.create(input.orgId, {
						eventType: 'member.updated',
						payload: {
							type: 'member.updated',
							data: {
								...optimisticMember
							}
						}
					})
				])
			);

			return;
		}),
	getMembers: adminProcedure
		.input(
			z.object({
				email: z.string().nullish(),
				name: z.string().nullish(),
				customValue: z.string().nullish(),
				customType: z.string().nullish(),
				tag: z.string().nullish(),
				limit: z.string().nullish(),
				plan: z.string().nullish(),
				before: z.string().nullish(),
				after: z.string().nullish()
			})
		)
		.query(async ({ input }) => {
			const emailFilter = input.email;
			const name = input.name;
			const formattedName = name ? `%${name}%` : null;

			const plan = input.plan;
			const formattedPlan = plan ? `%${plan}%` : null;

			const customValue = input.customValue;
			const customType = input.customType;

			const tag = input.tag;
			console.log(tag, 'TAGGGGGGG');

			const limit = input.limit === 'all' ? Number.MAX_SAFE_INTEGER : parseInt(input.limit ?? '10');
			const prevCursor = input.before;
			const nextCursor = input.after;
			if (prevCursor && nextCursor) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Cannot have both cursors'
				});
			}
			const cursor = prevCursor ?? nextCursor;
			const direction = prevCursor ? 'prev' : 'next';
			const order: any = 'desc';
			const conditions = and(
				cursor
					? direction === 'prev' //XOR comparison
						? gt(schema.member.createdAt, new Date(parseInt(cursor)))
						: lt(schema.member.createdAt, new Date(parseInt(cursor)))
					: undefined,
				eq(schema.member.orgId, input.orgId),
				emailFilter ? like(schema.user.email, `%${emailFilter}%`) : undefined,
				formattedName
					? sql`CONCAT(${schema.user.firstName}, ' ', ${schema.user.lastName}) ILIKE ${formattedName}`
					: undefined,
				tag ? arrayContains(schema.memberTag.names, [tag]) : undefined,
				customValue && customType
					? arrayContains(schema.formResponse.response, [
							{ label: customType, response: customValue }
						])
					: undefined
			);

			let query = db
				.select()
				.from(schema.member)
				.innerJoin(schema.user, eq(schema.user.id, schema.member.userId))
				.leftJoin(schema.formResponse, eq(schema.formResponse.id, schema.member.additionalInfoId))
				.leftJoin(schema.memberTag, eq(schema.memberTag.id, schema.member.id))
				.where(conditions)
				.orderBy(
					direction === 'prev' ? asc(schema.member.createdAt) : desc(schema.member.createdAt)
				)
				.limit(limit + 1)
				.$dynamic();

			if (formattedPlan) {
				const latestMembershipSQ = db
					.select({
						memId: schema.membership.memId,
						latest: sql<string>`MAX(${schema.membership.createdAt})`.as('latest')
					})
					.from(schema.membership)
					.groupBy(schema.membership.memId)
					.as('LatestMembership');

				query = query
					.innerJoin(schema.membership, eq(schema.membership.memId, schema.member.id))
					.innerJoin(schema.plan, eq(schema.plan.id, schema.membership.planId))
					.innerJoin(
						latestMembershipSQ,
						and(
							eq(latestMembershipSQ.memId, schema.member.id),
							eq(latestMembershipSQ.latest, schema.membership.createdAt)
						)
					)
					.where(and(ilike(schema.plan.name, `%${formattedPlan}%`), conditions));
			}

			const rows = await query;
			const result = rows.reduce<(Member & { user: User; additionalInfo: FormResponse | null })[]>(
				(acc, row) => {
					const user = row.User;
					const member = row.Member;
					acc.push({ ...member, user, additionalInfo: row.FormResponse });
					return acc;
				},
				[]
			);
			console.log(result.map((item) => item.user.firstName));

			const nextItem =
				result.length > limit ? (direction == 'prev' ? result.shift() : result.pop()) : undefined;

			const organizationForm = await db.query.organizationForm.findFirst({
				where: and(
					eq(schema.organizationForm.orgId, input.orgId),
					eq(schema.organizationForm.name, 'User Info')
				)
			});

			return {
				members: direction === 'prev' ? result.reverse() : result,
				organizationForm,
				pagination: {
					prevCursor:
						direction === 'prev'
							? result.length >= limit && result[0]
								? result[0].createdAt.getTime().toString()
								: null
							: cursor,
					nextCursor:
						direction === 'prev'
							? cursor
							: result.length >= limit && nextItem
								? nextItem.createdAt.getTime().toString()
								: null
				}
			};
		}),

	getMembersToScan: adminProcedure
		.input(
			z.object({
				name: z.string().nullish(),
				eventId: z.string(),
				memberId: z.string().nullish()
			})
		)
		.query(async ({ input }) => {
			const name = input.name;
			const formattedName = name ? `%${name}%` : null;

			const new_members = await db
				.select()
				.from(schema.member)
				.innerJoin(schema.user, eq(schema.member.userId, schema.user.id))
				.leftJoin(
					schema.attendance,
					and(
						eq(schema.attendance.memId, schema.member.id),
						eq(schema.attendance.eventId, input.eventId)
					)
				)
				.where(
					and(
						eq(schema.member.orgId, input.orgId),
						or(
							formattedName
								? sql`CONCAT(${schema.user.firstName}, ' ', ${schema.user.lastName}) ILIKE ${formattedName}`
								: undefined
						),
						input.memberId ? eq(schema.member.id, input.memberId) : undefined
					)
				);

			return {
				new_members
			};
		}),

	upsertAttendance: adminProcedure
		.input(
			z.object({
				eventId: z.string(),
				memberId: z.string(),
				attendanceId: z.string().optional()
			})
		)
		.mutation(async ({ input }) => {
			const result = await db
				.insert(schema.attendance)
				.values({
					eventId: input.eventId,
					id: input.attendanceId,
					memId: input.memberId
				})
				.onConflictDoUpdate({
					target: schema.attendance.id,
					set: { updatedAt: new Date() }
				})
				.returning();

			return result;
		}),

	deleteMember: adminProcedure
		.input(
			z.object({
				memberId: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const currentMemberId = ctx.user.orgs.find(
				(org) => org.memberId === input.memberId
			)?.memberId;
			if (input.memberId === currentMemberId) {
				new TRPCError({
					code: 'BAD_REQUEST',
					message: "You can't delete yourself :)"
				});
			}
			await db.delete(schema.member).where(eq(schema.member.id, input.memberId));

			await workos.userManagement.deleteOrganizationMembership(input.memberId);

			return;
		})
});
