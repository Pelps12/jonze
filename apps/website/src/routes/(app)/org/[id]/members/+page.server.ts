import db from '$lib/server/db';
import { and, eq, desc, like } from '@repo/db';
import type { PageServerLoad } from './$types';
import schema from '@repo/db/schema';
import type { FormResponse, Member, User } from '@repo/db/types';
import { error, type Actions } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, url }) => {
	const emailFilter = url.searchParams.get('email');

	const rows = await db
		.select()
		.from(schema.member)
		.innerJoin(schema.user, eq(schema.user.id, schema.member.userId))
		.leftJoin(schema.formResponse, eq(schema.formResponse.id, schema.member.additionalInfoId))
		.where(
			and(
				eq(schema.member.orgId, params.id),
				emailFilter ? like(schema.user.email, `%${emailFilter}%`) : undefined
			)
		)
		.orderBy(desc(schema.member.createdAt));

	const result = rows.reduce<(Member & { user: User; additionalInfo: FormResponse | null })[]>(
		(acc, row) => {
			const user = row.User;
			const member = row.Member;
			acc.push({ ...member, user, additionalInfo: row.FormResponse });
			return acc;
		},
		[]
	);

	console.log(result);

	const organizationForm = await db.query.organizationForm.findFirst({
		where: and(
			eq(schema.organizationForm.orgId, params.id),
			eq(schema.organizationForm.name, 'User Info')
		)
	});

	return { members: result, organizationForm };
};
