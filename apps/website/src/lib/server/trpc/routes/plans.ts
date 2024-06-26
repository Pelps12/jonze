import { procedure, router } from '..';
import db from '$lib/server/db';
import { and, eq, not } from '@repo/db';

import schema from '@repo/db/schema';
import type { ArrayElement } from '$lib/types/misc';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { newId } from '@repo/db/utils/createId';
import { dummyClient } from '$lib/server/posthog';
import { z } from 'zod';
import { planCreationSchema } from '../../../../routes/(app)/org/[id]/plans/schema';

export const planRouter = router({
	getPlans: procedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
		const plans = await db.query.plan.findMany({
			where: eq(schema.plan.orgId, input.id)
		});

		const availableForms = await db.query.organizationForm.findMany({
			where: and(
				eq(schema.organizationForm.orgId, input.id),
				not(eq(schema.organizationForm.name, 'User Info'))
			),
			columns: {
				id: true,
				name: true
			}
		});

		console.log(plans);
		const transformedPlans = plans.map((plan) => ({
			...plan,
			interval: { years: plan.interval?.years }
		}));

		return {
			plans: transformedPlans,
			availableForms,
			form: await superValidate(zod(planCreationSchema))
		};
	})
});
