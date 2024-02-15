import db from '$lib/server/drizzle/db';
import { and, eq } from 'drizzle-orm';
import type { PageServerLoad } from '../$types';
import schema from '$lib/server/drizzle/schema';

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
			additionalInfo: true,
			organization: {
				columns: {},
				with: {
					forms: {
						where: eq(schema.organizationForm.name, 'User Info')
					}
				}
			}
		},
		orderBy: (members, { desc }) => [desc(members.createdAt)]
	});

	const organizationForm = await db.query.organizationForm.findFirst({
		where: and(
			eq(schema.organizationForm.orgId, params.id),
			eq(schema.organizationForm.name, 'User Info')
		)
	});

	return { members, organizationForm };
};
