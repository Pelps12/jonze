<script>
	import { PUBLIC_STRIPE_KEY } from '$env/static/public';
	import { loadConnectAndInitialize } from '@stripe/connect-js';
	import { onMount } from 'svelte';
	import { mode } from 'mode-watcher';
	export let data;

	onMount(() => {
		const stripeConnectInstance = loadConnectAndInitialize({
			// This is your test publishable API key.
			publishableKey: PUBLIC_STRIPE_KEY,
			fetchClientSecret: async () => {
				return data.clientSecret ?? '';
			},
			fonts: [
				{
					cssSrc: 'https://fonts.googleapis.com/css2?family=Onest'
				}
			],
			appearance: {
				variables: {
					colorBackground: $mode === 'light' ? '#f3f2f1' : '#1B1918'
				}
			}
		});
		mode.subscribe((value) =>
			stripeConnectInstance.update({
				appearance: {
					variables: {
						colorBackground: value === 'light' ? '#f3f2f1' : '#1B1918'
					}
				}
			})
		);

		const accountOnboarding = stripeConnectInstance.create('account-onboarding');
		accountOnboarding.setOnExit(() => {
			console.log('User exited the onboarding flow');
		});
		const container = document.getElementById('onboardingElement');
		container?.appendChild(accountOnboarding);
	});
</script>

<div id="onboardingElement"></div>
