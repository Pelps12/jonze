<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { writable, type Writable } from 'svelte/store';

	let isYearly = false;
</script>

<section class="flex items-center justify-center mt-10 pb-10">
	<div
		class="p-4 sm:px-10 flex flex-col justify-center items-center text-base h-100vh mx-auto"
		id="pricing"
	>
		<div class="max-w-3xl text-center mx-auto z-20 relative p-2">
			<h1 class="block font-bold text-4xl md:text-5xl lg:text-6xl text-balance">
				Offerings for <span class="text-primary">orgs</span> of all sizes
			</h1>
		</div>

		<div class="flex items-center space-x-2 my-4">
			<Label for="airplane-mode">Monthly</Label>
			<Switch id="airplane-mode" bind:checked={isYearly} />
			<Label for="airplane-mode">Yearly</Label>
		</div>
		<div
			class="isolate mx-auto grid max-w-md grid-cols-1 md:grid-cols-2 gap-8 lg:mx-0 lg:max-w-none"
		>
			<div class="ring-1 ring-gray-200 rounded-3xl p-8 xl:p-10">
				<div class="flex items-center justify-between gap-x-4">
					<h3 id="tier-standard" class="text-outline text-2xl font-semibold leading-8">Standard</h3>
				</div>

				<p class="mt-6 flex items-baseline gap-x-1">
					<span class="text-5xl font-bold tracking-tight text-outline">$0</span><span
						class="text-2xl font-sans text-gray-500/70">/mo</span
					>
				</p>
				<Button
					href="/org/create"
					class="w-full shadow-sm  mt-6 block rounded-md py-2 px-3 text-center text-base font-medium leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
					>Get Started</Button
				>
				<ul role="list" class="mt-8 space-y-3 text-sm leading-6 text-neutral xl:mt-10 min-w-64">
					<!-- <li class="flex gap-x-3 text-base">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							aria-hidden="true"
							class="h-6 w-5 flex-none text-outline"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							></path>
						</svg>Still in Beta
					</li> -->
					<li class="flex gap-x-3 text-base">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							aria-hidden="true"
							class="h-6 w-5 flex-none text-outline"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							></path>
						</svg>200 users
					</li>
					<li class="flex gap-x-3 text-base">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							aria-hidden="true"
							class="h-6 w-5 flex-none text-outline"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							></path>
						</svg>3 integrations
					</li>
					<li class="flex gap-x-3 text-base">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							aria-hidden="true"
							class="h-6 w-5 flex-none text-outline"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							></path>
						</svg>7%+ 80¢ per membership
					</li>
				</ul>
			</div>
			<div class="animate-pulse ring-2 ring-primary rounded-3xl p-8 xl:p-10">
				<div class="flex items-center justify-between gap-x-4">
					<h3 id="tier-extended" class="text-primary text-2xl font-semibold leading-8">
						Jonze Plus
					</h3>
				</div>
				<p class="mt-6 flex items-baseline gap-x-1">
					{#if isYearly}
						<span class="text-5xl font-bold tracking-tight text-outline">$50</span><span
							class="text-2xl font-sans text-gray-500/70">/yr</span
						>
					{:else}
						<span class="text-5xl font-bold tracking-tight text-outline">$5</span><span
							class="text-2xl font-sans text-gray-500/70">/mo</span
						>
					{/if}
				</p>

				<input class="hidden" name="period" value={isYearly ? 'yearly' : 'monthly'} />
				<Button
					type="submit"
					aria-describedby="tier-extended"
					class="w-full shadow-sm  mt-6 block rounded-md py-2 px-3 text-center text-base font-medium leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
					>Subscribe</Button
				>

				<ul role="list" class="mt-8 space-y-3 text-sm leading-6 text-neutral xl:mt-10">
					<li class="flex gap-x-3 text-base">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							aria-hidden="true"
							class="h-6 w-5 flex-none text-primary"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							></path>
						</svg>Unlimited users
					</li>
					<li class="flex gap-x-3 text-base">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							aria-hidden="true"
							class="h-6 w-5 flex-none text-primary"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							></path>
						</svg>Unlimited Integrations
					</li>

					<li class="flex gap-x-3 text-base">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							aria-hidden="true"
							class="h-6 w-5 flex-none text-primary"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							></path>
						</svg>5% + 50¢ per membership
					</li>
				</ul>
			</div>
		</div>
	</div>
</section>
