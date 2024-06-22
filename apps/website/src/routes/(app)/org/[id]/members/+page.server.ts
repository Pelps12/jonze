import db from '$lib/server/db';
import { and, eq, desc, like, gt, asc, lt, gte, lte, sql, ilike, arrayContains } from '@repo/db';
import type { PageServerLoad } from './$types';
import schema from '@repo/db/schema';
import type { FormResponse, Member, User } from '@repo/db/types';
import { error, type Actions } from '@sveltejs/kit';
import { alias } from 'drizzle-orm/pg-core';

export const load: PageServerLoad = async ({ params, url }) => {
	const emailFilter = url.searchParams.get('email');
	const name = url.searchParams.get('name');
	const formattedName = name ? `%${name}%` : null;

	const plan = url.searchParams.get('plan');
	const formattedPlan = plan ? `%${plan}%` : null;

	const customValue = url.searchParams.get('custom_value');
	const customType = url.searchParams.get('custom_type');

	const tag = url.searchParams.get('tag');
	console.log(tag, 'TAGGGGGGG');

	const limit =
		url.searchParams.get('limit') === 'all'
			? Number.MAX_SAFE_INTEGER
			: parseInt(url.searchParams.get('limit') ?? '10');
	const prevCursor = url.searchParams.get('before');
	const nextCursor = url.searchParams.get('after');
	if (prevCursor && nextCursor) {
		error(400, 'Cannot have both cursors');
	}
	const cursor = prevCursor ?? nextCursor;
	const direction = prevCursor ? 'prev' : 'next';
	const order: any = 'desc';

	let query = db
		.select()
		.from(schema.member)
		.innerJoin(schema.user, eq(schema.user.id, schema.member.userId))
		.leftJoin(schema.formResponse, eq(schema.formResponse.id, schema.member.additionalInfoId))
		.leftJoin(schema.memberTag, eq(schema.memberTag.id, schema.member.id))
		.where(
			and(
				cursor
					? direction === 'prev' //XOR comparison
						? gte(schema.member.id, cursor)
						: lte(schema.member.id, cursor)
					: undefined,
				eq(schema.member.orgId, params.id),
				emailFilter ? like(schema.user.email, `%${emailFilter}%`) : undefined,
				formattedName
					? sql`CONCAT(${schema.user.firstName}, ' ', ${schema.user.lastName}) ILIKE ${formattedName}`
					: undefined,
				tag ? arrayContains(schema.memberTag.names, [tag]) : undefined
			)
		)
		.orderBy(direction === 'prev' ? asc(schema.member.createdAt) : desc(schema.member.createdAt))
		.limit(limit + 1)
		.offset(0)
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
			.where(ilike(schema.plan.name, `%${formattedPlan}%`));
	}

	if (customValue && customType) {
		const id = [{ label: customType, response: customValue }];
		query = query.where(arrayContains(schema.formResponse.response, id));
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
			eq(schema.organizationForm.orgId, params.id),
			eq(schema.organizationForm.name, 'User Info')
		)
	});

	return {
		members: direction === 'prev' ? result.reverse() : result,
		organizationForm,
		pagination: {
			prevCursor:
				direction === 'prev' ? (result.length >= limit && result[0] ? result[0].id : null) : cursor,
			nextCursor:
				direction === 'prev' ? cursor : result.length >= limit && nextItem ? nextItem.id : null
		}
	};
};
