import db from '$lib/server/db';
import schema from '@repo/db/schema';
import { ZodCustomForm } from '$lib/types/forms';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import posthog, { dummyClient } from '$lib/server/posthog';

export const POST: RequestHandler = async ({ request, locals, getClientAddress, platform }) => {
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

	if (locals.user) {
		const useragent = request.headers.get('user-agent');
		dummyClient.capture({
			distinctId: locals.user.id,
			event: 'form created',
			properties: {
				$ip: getClientAddress(),
				name: data.formName,
				orgId: data.organizationId,
				...(useragent && { $useragent: useragent })
			}
		});
	}

	platform?.context.waitUntil(dummyClient.flushAsync());

	return json(orgForm);
};

export const PUT: RequestHandler = async ({ request, locals, getClientAddress, platform }) => {
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

	if (locals.user) {
		const useragent = request.headers.get('user-agent');
		dummyClient.capture({
			distinctId: locals.user.id,
			event: 'form updated',
			properties: {
				$ip: getClientAddress(),
				name: data.formName,
				orgId: data.organizationId,
				...(useragent && { $useragent: useragent })
			}
		});
	}

	platform?.context.waitUntil(Promise.resolve(dummyClient.flushAsync()));

	return json(orgForm);
};
