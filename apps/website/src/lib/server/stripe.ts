import { Stripe } from 'stripe';
import { STRIPE_SECRET_KEY } from '$env/static/private';

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
	apiVersion: '2024-04-10; custom_checkout_beta=v1' as any
});
