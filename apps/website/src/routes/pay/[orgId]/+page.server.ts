import db from '$lib/server/db';
import { eq, and, gt } from '@repo/db';
import type { PageServerLoad } from './$types';
import schema from '@repo/db/schema';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const org = await db.query.organization.findFirst({
		where: eq(schema.organization.id, params.orgId),

		with: {
			plans: {
				where: gt(schema.plan.amount, '0.00'),
				columns: {
					id: true,
					name: true,
					amount: true
				}
			}
		}
	});

	locals.logger?.info('Organization', org);

	if (!org) {
		error(404, 'Org Not Found');
	}

	return { org };
};
