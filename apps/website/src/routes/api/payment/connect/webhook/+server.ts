import { stripe } from '$lib/server/stripe';
import { error, json, type NumericRange, type RequestHandler } from '@sveltejs/kit';
import Stripe from 'stripe';
import { STRIPE_WEBHOOK_CONNECT_SECRET } from '$env/static/private';
import schema from '@repo/db/schema';
import db from '$lib/server/db';
import { dummyClient } from '$lib/server/posthog';
import svix from '$lib/server/svix';
import { eq } from '@repo/db';
export const POST: RequestHandler = async ({ request, platform }) => {
	const sig = request.headers.get('stripe-signature');
	const buf = await request.text();
	if (!sig) error(400, 'Invalid request');

	let event: Stripe.Event;
	console.log(STRIPE_WEBHOOK_CONNECT_SECRET, sig);

	try {
		event = await stripe.webhooks.constructEventAsync(buf, sig, STRIPE_WEBHOOK_CONNECT_SECRET);
	} catch (err: any) {
		error(400, `Webhook Error: ${err.message}`);
	}
	try {
		switch (event.type) {
			case 'checkout.session.completed':
				const data = event.data.object;
				const memId = data.metadata?.memId;
				const userId = data.metadata?.userId;
				const orgId = data.metadata?.orgId;
				const planId = data.metadata?.planId;
				const responseId = data.metadata?.responseId;
				if (!memId || !planId || !userId || !orgId) error(400, 'Invalid Metadata');

				const [newMembership] = await db
					.insert(schema.membership)
					.values({
						planId,
						memId,
						provider: 'Jonze',
						responseId
					})
					.returning();
				const member = await db.query.member.findFirst({
					where: eq(schema.member.id, memId)
				});

				dummyClient.capture({
					distinctId: userId,
					event: 'new user membership',
					properties: {
						memId,
						orgId,
						method: 'managed',
						id: newMembership.id
					}
				});
				platform?.context.waitUntil(
					Promise.all([
						svix.message.create(orgId, {
							eventType: 'membership.updated',
							payload: {
								type: 'membership.updated',
								data: {
									...{ ...newMembership, member }
								}
							}
						})
					])
				);

				break;
			default:
				error(400, `Unhandled event type ${event.type}`);
		}
	} catch (err: any) {
		if (err instanceof Stripe.errors.StripeError) {
			error((err.statusCode as any) ?? 500, err.message);
		} else {
			error(500);
		}
	}

	return json({
		success: 'true'
	});
};
