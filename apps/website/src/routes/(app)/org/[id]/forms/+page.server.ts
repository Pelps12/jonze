import db from '$lib/server/db';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from '../$types';
import schema from '@repo/db/schema';

export const load: PageServerLoad = async ({ params }) => {
	const forms = await db.query.organizationForm.findMany({
		where: eq(schema.organizationForm.orgId, params.id),
		columns: {
			id: true,
			name: true,
			updatedAt: true,
			createdAt: true
		},
		with: {
			responses: {
				limit: 1
			}
		},
		orderBy: (form, { desc }) => [desc(form.updatedAt)]
	});

	return { forms };
};
