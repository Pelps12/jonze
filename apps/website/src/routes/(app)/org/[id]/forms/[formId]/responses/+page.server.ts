import db from '$lib/server/db';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import schema from '@repo/db/schema';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, url }) => {
	const form = await db.query.organizationForm.findFirst({
		where: eq(schema.organizationForm.id, params.formId),
		with: {
			responses: {
				with: {
					member: {
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
						}
					}
				}
			}
		}
	});

	if (!form) {
		error(404, 'Form Not Found');
	}

	return { form };
};
