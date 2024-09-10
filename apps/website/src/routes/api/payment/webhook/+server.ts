import { stripe } from '$lib/server/stripe';
import { error, json, type NumericRange, type RequestHandler } from '@sveltejs/kit';
import Stripe from 'stripe';
import { STRIPE_WEBHOOK_SECRET } from '$env/static/private';
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
	console.log(STRIPE_WEBHOOK_SECRET, sig);

	try {
		event = await stripe.webhooks.constructEventAsync(buf, sig, STRIPE_WEBHOOK_SECRET);
	} catch (err: any) {
		error(400, `Webhook Error: ${err.message}`);
	}
	try {
		switch (event.type) {
			case 'invoice.paid':
				const orgId = event.data.object.subscription_details?.metadata?.orgId;
				if (!orgId) error(400, 'Org Id required in Subscription Metadata');
				console.log(orgId);

				await db
					.update(schema.organization)
					.set({
						plan: 'plus'
					})
					.where(eq(schema.organization.id, orgId));

				break;

			default:
				error(400, `Unhandled event type ${event.type}`);
		}
	} catch (err: any) {
		if (err instanceof Stripe.errors.StripeError) {
			error((err.statusCode as any) ?? 500, err.message);
		} else {
			console.error(err);
			error(500);
		}
	}

	return json({
		success: 'true'
	});
};
