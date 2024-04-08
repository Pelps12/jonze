<script lang="ts">
	import {
		loadStripe,
		type Stripe,
		type StripeCustomCheckout,
		type StripeElements
	} from '@stripe/stripe-js';
	import { onMount } from 'svelte';
	export let data;
	import { mode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button';
	import { twJoin } from 'tailwind-merge';
	import * as Card from '$lib/components/ui/card';
	import { toast } from 'svelte-sonner';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { page } from '$app/stores';
	import { formatName } from '$lib/utils.js';
	import { PUBLIC_STRIPE_KEY, PUBLIC_URL } from '$env/static/public';

	let loading = true;
	let stripe: Stripe | null;
	let elements: StripeElements | null;
	let checkout: StripeCustomCheckout | null;

	onMount(async () => {
		stripe = await loadStripe(PUBLIC_STRIPE_KEY, {
			stripeAccount: data.stripeAccount,
			betas: ['custom_checkout_beta_2']
		});
		console.log(stripe, data.clientSecret);
		if (stripe && data.clientSecret) {
			/* 			const checkout = await stripe.initEmbeddedCheckout({
				clientSecret: data.clientSecret
			});
			checkout.mount('#checkout'); */

			checkout = await stripe.initCustomCheckout({
				clientSecret: data.clientSecret ?? '',
				elementsOptions: {
					fonts: [
						{
							cssSrc: 'https://fonts.googleapis.com/css2?family=Onest'
						}
					],
					appearance: {
						variables: {
							fontFamily: 'Onest',
							colorBackground: $mode === 'light' ? '#f3f2f1' : '#161413',
							colorText: $mode === 'light' ? '#161413' : '#f3f2f1'
						}
					}
				}
			});

			mode.subscribe((value) =>
				checkout?.changeAppearance({
					variables: {
						fontFamily: 'Onest',
						colorBackground: value === 'light' ? '#f3f2f1' : '#161413',
						colorText: $mode === 'light' ? '#161413' : '#f3f2f1'
					}
				})
			);

			const paymentElement = checkout.createElement('payment', {
				layout: {
					type: 'accordion',
					defaultCollapsed: false,
					radios: false,
					spacedAccordionItems: true
				}
			});

			const expressCheckoutElement = checkout.createElement('expressCheckout' as any);
			paymentElement.mount('#payment-element');

			expressCheckoutElement.mount('#express-element');

			loading = false;
		}
	});

	const handleSubmit = async (
		e: SubmitEvent & {
			currentTarget: EventTarget & HTMLFormElement;
		}
	) => {
		console.log(stripe, checkout);
		if (stripe && checkout) {
			const { error, session } = await checkout.confirm({
				return_url: PUBLIC_URL
			});
			// This point will only be reached if there is an immediate error when
			// confirming the payment. Otherwise, your customer will be redirected to
			// your `return_url`. For some payment methods like iDEAL, your customer will
			// be redirected to an intermediate site first to authorize the payment, then
			// redirected to the `return_url`.
			if (!error) {
				window.location.href = `${PUBLIC_URL}?payment_success=true`;
			} else {
				if (error.type === 'card_error' || error.type === 'validation_error') {
					toast.error(error.message ?? 'Unknown Error');
				} else {
					console.log(error);
					toast.error('An unexpected error occurred.');
				}
			}
		}
	};
</script>

<div class="m-3">
	<div>
		{#if data.org.logo}
			<img src={data.org.logo} alt="Organization" width="100" height="100" class="mx-auto" />
		{/if}

		<p class="text-center font-bold text-xl">{data.org.name}</p>
	</div>

	<form
		class="max-w-2xl mx-auto z-[-1] flex flex-col gap-2 border m-5 rounded-md"
		on:submit|preventDefault={(e) => handleSubmit(e)}
	>
		<div
			class=" text-sm bg-secondary rounded-tl-md rounded-br-md font-semibold px-4 py-2 flex items-start w-20 gap-0.5"
		>
			<img src="/logo.svg" alt="Logo" class="h-4 w-4" />
			Jonze
		</div>

		<div class="p-4">
			<div class="relative flex items-start space-x-4 p-4">
				<Avatar.Root class="w-10 h-10 border">
					<Avatar.Image src={data.user?.profilePictureUrl} />
					<Avatar.Fallback
						>{(data.user?.firstName?.charAt(0) ?? 'U') +
							(data.user?.lastName?.charAt(0) ?? '')}</Avatar.Fallback
					>
				</Avatar.Root>
				<div class="text-sm grid gap-1">
					<Card.Title class="text-base font-semibold">
						{formatName(data.user?.firstName ?? null, data.user?.lastName ?? null)}
					</Card.Title>
					<Card.Description class="text-sm">
						{data.user?.email}
					</Card.Description>
				</div>
			</div>
			<Card.Root class="my-2">
				<Card.Header>
					<Card.Title>{data.price_data.name}</Card.Title>
					<Card.Description
						>Price: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
							data.price_data.amount / 100
						)}</Card.Description
					>
				</Card.Header>
			</Card.Root>
			<div id="express-element"></div>

			<div id="payment-element"></div>

			<Button type="submit" class={twJoin(['w-full', loading && 'animate-pulse'])}>PAY</Button>
		</div>
	</form>
</div>
