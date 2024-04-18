import db from '$lib/server/db';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from '../$types';
import schema from '@repo/db/schema';
import { error, json, type Actions } from '@sveltejs/kit';
import { z } from 'zod';
import { ZodCustomForm, type CustomForm } from '$lib/types/forms';
import { dummyClient } from '$lib/server/posthog';

const hasDuplicateIds = (array: CustomForm) => {
	const seenIds = new Set();
	for (const item of array) {
		if (seenIds.has(item.label)) {
			return true; // Duplicate found
		}
		seenIds.add(item.label);
	}
	return false;
};

export const load: PageServerLoad = async ({ params }) => {
	const form = await db.query.organizationForm.findFirst({
		where: eq(schema.organizationForm.id, params.formId)
	});

	if (!form) {
		error(404, 'Form not Found');
	}

	return { form };
};
