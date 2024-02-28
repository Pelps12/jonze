import db from '$lib/server/db';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import schema from '@repo/db/schema';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const member = await db.query.member.findFirst({
		where: eq(schema.member.id, params.memId),
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
			user: {
				columns: {
					id: true,
					firstName: true,
					lastName: true,
					profilePictureUrl: true,
					email: true
				}
			}
		}
	});
	if (!member) {
		error(404, 'User not Found');
	}
	return {
		member
	};
};
