import db from '$lib/server/db';
import { and, eq } from 'drizzle-orm';
import type { PageServerLoad } from '../$types';
import schema from '@repo/db/schema';

export const load: PageServerLoad = async ({ params }) => {
	const members = await db.query.member.findMany({
		where: eq(schema.member.orgId, params.id),
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
			},
			additionalInfo: true
		},
		orderBy: (members, { desc }) => [desc(members.createdAt)]
	});

	console.log(members);

	const organizationForm = await db.query.organizationForm.findFirst({
		where: and(
			eq(schema.organizationForm.orgId, params.id),
			eq(schema.organizationForm.name, 'User Info')
		)
	});

	return { members, organizationForm };
};
