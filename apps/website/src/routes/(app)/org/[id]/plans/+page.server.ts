import db from '$lib/server/db';
import { and, eq, not } from '@repo/db';
import type { Actions, PageServerLoad } from './$types';
import schema from '@repo/db/schema';
import type { ArrayElement } from '$lib/types/misc';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { planCreationSchema } from './schema';
import { fail, redirect } from '@sveltejs/kit';
import { newId } from '@repo/db/utils/createId';
import { dummyClient } from '$lib/server/posthog';

export const load: PageServerLoad = async ({ params }) => {
	const plans = await db.query.plan.findMany({
		where: eq(schema.plan.orgId, params.id)
	});

	const availableForms = await db.query.organizationForm.findMany({
		where: and(
			eq(schema.organizationForm.orgId, params.id),
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
};

export const actions: Actions = {
	create: async (event) => {
		const form = await superValidate(event, zod(planCreationSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		console.log(form.data);

		const planId = newId('plan');
		const newEvent = await db.insert(schema.plan).values({
			id: planId,
			start: form.data.start,
			amount: form.data.amount.toFixed(2),
			orgId: event.params.id,
			name: form.data.name,
			interval: form.data.interval
		});
		const useragent = event.request.headers.get('user-agent');
		event.locals.user &&
			dummyClient.capture({
				distinctId: event.locals.user.id,
				event: 'plan created',
				properties: {
					$ip: event.getClientAddress(),
					planId: planId,
					orgId: event.params.id,
					name: form.data.name,
					...(useragent && { $useragent: useragent })
				}
			});
		if (newEvent) {
			event.platform?.context.waitUntil(dummyClient.flushAsync());
			redirect(302, event.url);
		}

		return {
			form
		};
	}
};
