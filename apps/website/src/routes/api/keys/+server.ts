import db from '$lib/server/db';
import unkey from '$lib/server/unkey';
import schema from '@repo/db/schema';
import { error, type RequestHandler } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const DELETE: RequestHandler = async ({ request }) => {
	const result = await z
		.object({
			keyId: z.string()
		})
		.spa(await request.json());
	if (!result.success) {
		error(400, 'Poorly formatted input');
	}
	const { data } = result;

	const deletedKey = await unkey.keys.delete({
		keyId: data.keyId
	});

	if (deletedKey.error) {
		error(500, deletedKey.error.message);
	}
	await db.delete(schema.apiKey).where(eq(schema.apiKey.keyId, data.keyId));

	return new Response(null, {
		status: 204
	});
};
