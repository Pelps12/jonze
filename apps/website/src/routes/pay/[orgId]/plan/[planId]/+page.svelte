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
	import { formatName, getInitials } from '$lib/utils.js';
	import { PUBLIC_STRIPE_KEY, PUBLIC_URL } from '$env/static/public';
	import Preview from '$lib/components/custom/form/UI/Preview.svelte';
	import { writable } from 'svelte/store';
	import { enhance } from '$app/forms';
	import { Image } from '@unpic/svelte';
	import { LoaderCircle } from 'lucide-svelte';

	let loading = false;
	let stripe: Stripe | null;
	let checkout: StripeCustomCheckout | null;

	let submissionState: 'start' | 'form_submitted' | 'stripe_submitted' = 'start';

	const form = writable();
	const returnURL = new URL(
		$page.url.searchParams.get('callbackUrl') ?? data.org.website ?? PUBLIC_URL
	);

	onMount(async () => {
		if (!data.form) {
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
				submissionState = 'form_submitted';
			}
		}
	});

	const handlePayment = async () => {
		console.log(stripe, checkout);
		if (stripe && checkout && submissionState === 'form_submitted') {
			const { error, session } = await checkout.confirm({
				return_url: PUBLIC_URL
			});
			// This point will only be reached if there is an immediate error when
			// confirming the payment. Otherwise, your customer will be redirected to
			// your `return_url`. For some payment methods like iDEAL, your customer will
			// be redirected to an intermediate site first to authorize the payment, then
			// redirected to the `return_url`.
			if (error) {
				console.log(error);
				toast.error(error.message ?? 'An unexpected error occurred.');

				return;
			} else {
				returnURL.searchParams.set('payment_successful', 'true');
				window.location.href = returnURL.toString();
			}
		}
	};
</script>

<div class="m-3">
	<div>
		{#if data.org.logo}
			<Image src={data.org.logo} alt="Organization" width={100} height={100} class="mx-auto" />
		{/if}

		<p class="text-center font-bold text-xl">{data.org.name}</p>
	</div>

	<form
		class="max-w-2xl mx-auto z-[-1] flex flex-col gap-2 border m-5 rounded-md"
		method="post"
		use:enhance={async ({ formData, cancel }) => {
			if (data.form) {
				let count = 0;
				for (const pair of formData.entries()) {
					const fieldName = pair[0];
					const { label: backEndFieldName } = data.form.form[count];
					console.log(backEndFieldName, fieldName);
					if (fieldName !== backEndFieldName) {
						toast.error('Form is not complete');
						cancel();
						return;
					}
					count++;
				}
			} else {
				cancel();
			}
			cancel();

			return async ({ result, update }) => {
				// `result` is an `ActionResult` object
				// `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
				submissionState = 'form_submitted';
				loading = true;

				stripe = await loadStripe(PUBLIC_STRIPE_KEY, {
					stripeAccount: data.stripeAccount,
					betas: ['custom_checkout_beta_2']
				});
				console.log(stripe, data.clientSecret);
				if (result.type === 'success') {
					console.log(result);
					if (stripe && result.data?.clientSecret) {
						checkout = await stripe.initCustomCheckout({
							//@ts-ignore
							clientSecret: result.data?.clientSecret,
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
						//@ts-ignore
						const expressCheckoutElement = checkout.createElement('expressCheckout');
						paymentElement.mount('#payment-element');

						expressCheckoutElement.mount('#express-element');

						loading = false;
					}
				}
			};
		}}
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
						>{getInitials(
							formatName(data.user?.firstName ?? null, data.user?.lastName ?? null)
						)}</Avatar.Fallback
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

			{#if data.form && submissionState === 'start'}
				<div class="my-4">
					<Preview form={data.form.form} userResponse={undefined} />
				</div>
			{/if}
			<div id="express-element"></div>

			<div id="payment-element" class="mb-3"></div>

			<Button
				type={submissionState === 'start' ? 'submit' : 'button'}
				class={twJoin(['w-full', loading && 'animate-pulse'])}
				on:click={(e) => handlePayment()}
			>
				{#if loading}
					<LoaderCircle class="mr-2 h-4 w-4" />
				{/if}
				{submissionState === 'start' ? 'SUBMIT' : 'PAY'}</Button
			>
		</div>
	</form>
</div>
