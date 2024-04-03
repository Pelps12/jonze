import { stripe } from '$lib/server/stripe';
import { error, json, type NumericRange, type RequestHandler } from '@sveltejs/kit';
import Stripe from 'stripe';
import { STRIPE_WEBHOOK_SECRET } from '$env/static/private';
import schema from '@repo/db/schema';
import db from '$lib/server/db';
export const POST: RequestHandler = async ({ request }) => {
	const sig = request.headers.get('stripe-signature');
	const buf = await request.text();
	if (!sig) error(400, 'Invalid request');

	let event: Stripe.Event;
	console.log(STRIPE_WEBHOOK_SECRET, sig);

	try {
		event = stripe.webhooks.constructEvent(buf, sig, STRIPE_WEBHOOK_SECRET);
	} catch (err: any) {
		error(400, `Webhook Error: ${err.message}`);
	}
	try {
		switch (event.type) {
			case 'checkout.session.completed':
				const data = event.data.object;
				const memId = data.metadata?.memId;
				const planId = data.metadata?.planId;
				if (!memId || !planId) error(400, 'Invalid Metadata');

				await db.insert(schema.membership).values({
					planId,
					memId,
					provider: 'Jonze'
				});
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
