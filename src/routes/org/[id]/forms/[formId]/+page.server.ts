import db from '$lib/server/drizzle/db';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from '../$types';
import schema from '$lib/server/drizzle/schema';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const form = await db.query.organizationForm.findFirst({
		where: eq(schema.organizationForm.id, params.formId)
	});

	if (!form) {
		error(404, 'Form not Found');
	}

	return { form };
};
