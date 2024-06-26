import db from '$lib/server/db';
import { and, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import schema from '@repo/db/schema';
import { error } from '@sveltejs/kit';

/* export const load: PageServerLoad = async ({ params }) => {
	//ADD AUTHENTICATION

	//Gets event with all attendants, their user information and their responses
	const event = await db.query.event.findFirst({
		where: and(eq(schema.event.id, params.eventId), eq(schema.event.orgId, params.id)),
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
		error(404, 'Event not Found');
	}

	return { event };
}; */
