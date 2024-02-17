import db from '@repo/db';
import schema from '@repo/db/schema';
import { ZodCustomForm } from '$lib/types/forms';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const POST: RequestHandler = async ({ request }) => {
	const result = await z
		.object({
			organizationId: z.string(),
			form: ZodCustomForm,
			formName: z.string()
		})
		.spa(await request.json());
	if (!result.success) {
		error(400, 'Poorly formatted input');
	}
	const { data } = result;
	const orgForm = await db.insert(schema.organizationForm).values({
		orgId: data.organizationId,
		form: data.form,
		name: data.formName
	});

	return json(orgForm);
};

export const PUT: RequestHandler = async ({ request }) => {
	const result = await z
		.object({
			organizationId: z.string(),
			form: ZodCustomForm,
			formId: z.string(),
			formName: z.string()
		})
		.spa(await request.json());
	if (!result.success) {
		error(400, 'Poorly formatted input');
	}
	const { data } = result;
	const orgForm = await db
		.update(schema.organizationForm)
		.set({
			orgId: data.organizationId,
			form: data.form,
			name: data.formName,
			updatedAt: new Date()
		})
		.where(eq(schema.organizationForm.id, data.formId));

	return json(orgForm);
};
