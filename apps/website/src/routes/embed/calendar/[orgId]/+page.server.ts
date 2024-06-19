import db from '$lib/server/db';
import { eq } from '@repo/db';
import type { PageServerLoad } from './$types';
import schema from '@repo/db/schema';

export const load: PageServerLoad = async (event) => {
	const dbEvents = await db.query.event.findMany({
		where: eq(schema.event.orgId, event.params.orgId),
		columns: {
			id: true,
			name: true,
			start: true,
			end: true
		}
	});
	return {
		events: dbEvents
	};
};
