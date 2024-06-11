import { error, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { stripe } from '$lib/server/stripe';
import { PUBLIC_URL } from '$env/static/public';

export const actions: Actions = {
	default: async (event) => {
		const formdata = await event.request.formData();
		const period = formdata.get('period');
		if (!period || (period !== 'yearly' && period !== 'montly')) {
			error(400);
		}

		console.log(period);

		const prices = await stripe.prices.list({
			lookup_keys: [`plus_${period}`],
			expand: ['data.product']
		});
		const session = await stripe.checkout.sessions.create({
			line_items: [
				{
					price: prices.data[0].id,
					// For metered billing, do not pass quantity
					quantity: 1
				}
			],
			mode: 'subscription',
			success_url: event.url.toString(),
			cancel_url: event.url.toString()
		});

		return redirect(302, event.url);
	}
};
