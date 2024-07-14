import { adminProcedure, procedure, router } from '..';
import db from '$lib/server/db';
import { and, eq, not } from '@repo/db';

import schema from '@repo/db/schema';
import type { ArrayElement } from '$lib/types/misc';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { newId } from '@repo/db/utils/createId';
import { dummyClient } from '$lib/server/posthog';
import { z } from 'zod';
import { planCreationSchema } from '$lib/formSchema/plan';
import { stripe } from '$lib/server/stripe';
import { PUBLIC_URL } from '$env/static/public';
import { TRPCError } from '@trpc/server';

export const planRouter = router({
	getPlans: adminProcedure.query(async ({ input }) => {
		const plans = await db.query.plan.findMany({
			where: eq(schema.plan.orgId, input.orgId)
		});

		const availableForms = await db.query.organizationForm.findMany({
			where: and(
				eq(schema.organizationForm.orgId, input.orgId),
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
			//@ts-ignore
			interval: { years: plan.interval }
		}));

		return {
			plans: transformedPlans,
			availableForms,
			form: await superValidate(zod(planCreationSchema))
		};
	}),
	createPlan: adminProcedure.input(planCreationSchema).mutation(async ({ input, ctx }) => {
		const planId = newId('plan');
		const newEvent = await db.insert(schema.plan).values({
			id: planId,
			start: input.start,
			amount: input.amount.toFixed(2),
			orgId: input.orgId,
			name: input.name,
			interval: input.interval
		});
		const useragent = ctx.event.request.headers.get('user-agent');
		ctx.event.locals.user &&
			dummyClient.capture({
				distinctId: ctx.event.locals.user.id,
				event: 'plan created',
				properties: {
					$ip: ctx.event.getClientAddress(),
					planId: planId,
					orgId: input.orgId,
					name: input.name,
					...(useragent && { $useragent: useragent })
				}
			});
		if (newEvent) {
			ctx.event.platform?.context.waitUntil(dummyClient.flushAsync());
		}

		return;
	}),
	onboarding: adminProcedure.query(async ({ input, ctx }) => {
		let subAccountId: string | undefined = undefined;
		let onboardingComplete = false;

		const orgSubAccount = await db.query.organizationSubaccount.findFirst({
			where: eq(schema.organizationSubaccount.orgId, input.orgId),
			columns: {
				subaccountId: true
			}
		});
		if (!orgSubAccount) {
			const { id } = await stripe.accounts.create({
				type: 'standard'
			});

			await db.insert(schema.organizationSubaccount).values({
				orgId: input.orgId,
				subaccountId: id
			});
			subAccountId = id;
		} else {
			const { details_submitted } = await stripe.accounts.retrieve(orgSubAccount.subaccountId);
			console.log('HAVE DETAILS BEN SUBMITTED', details_submitted);
			if (details_submitted) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: `${PUBLIC_URL}/org/${input.orgId}/plans`
				});
			}
			subAccountId = orgSubAccount.subaccountId;
		}

		const accountSession = await stripe.accountSessions.create({
			account: subAccountId,
			components: {
				account_onboarding: {
					enabled: true,
					features: {
						external_account_collection: true
					}
				}
			}
		});
		return { clientSecret: accountSession.client_secret };
	})
});
