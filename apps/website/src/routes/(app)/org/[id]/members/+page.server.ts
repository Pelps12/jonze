import db from '$lib/server/db';
import { and, eq, desc, like, gt, asc, lt, gte, lte } from '@repo/db';
import type { PageServerLoad } from './$types';
import schema from '@repo/db/schema';
import type { FormResponse, Member, User } from '@repo/db/types';
import { error, type Actions } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, url }) => {
	const emailFilter = url.searchParams.get('email');

	const limit = parseInt(url.searchParams.get('limit') ?? '10');
	const prevCursor = url.searchParams.get('before');
	const nextCursor = url.searchParams.get('after');
	if (prevCursor && nextCursor) {
		error(400, 'Cannot have both cursors');
	}
	const cursor = prevCursor ?? nextCursor;
	const direction = prevCursor ? 'prev' : 'next';
	const order: any = 'desc';

	const rows = await db
		.select()
		.from(schema.member)
		.innerJoin(schema.user, eq(schema.user.id, schema.member.userId))
		.leftJoin(schema.formResponse, eq(schema.formResponse.id, schema.member.additionalInfoId))
		.where(
			and(
				cursor
					? direction === 'prev' //XOR comparison
						? gte(schema.member.id, cursor)
						: lte(schema.member.id, cursor)
					: undefined,
				eq(schema.member.orgId, params.id),
				emailFilter ? like(schema.user.email, `%${emailFilter}%`) : undefined
			)
		)
		.orderBy(direction === 'prev' ? asc(schema.member.createdAt) : desc(schema.member.createdAt))
		.limit(limit + 1)
		.offset(0);

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

	const nextItem = direction == 'prev' ? result.shift() : result.pop();

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
