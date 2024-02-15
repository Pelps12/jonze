import db from '$lib/server/drizzle/db';
import { and, eq, or } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import schema from '$lib/server/drizzle/schema';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		redirect(302, '/');
	}
	const authorized = await db.query.member.findFirst({
		where: and(
			eq(schema.member.orgId, params.id),
			eq(schema.member.userId, locals.user.id),
			or(eq(schema.member.role, 'ADMIN'), eq(schema.member.role, 'OWNER'))
		)
	});

	if (!authorized) {
		error(401, 'User are not an admin for this org');
	}
	const organization = await db.query.organization.findFirst({
		where: eq(schema.organization.id, params.id),
		with: {
			members: {
				with: {
					user: {
						columns: {
							id: true,
							firstName: true,
							lastName: true,
							email: true,
							profilePictureUrl: true
						}
					}
				},
				limit: 3,
				orderBy: (member, { desc }) => [desc(member.createdAt)]
			}
		}
	});

	if (!organization) {
		error(404, 'Organization not Found');
	}

	return { organization };
};
