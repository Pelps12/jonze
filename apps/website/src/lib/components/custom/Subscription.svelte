<script lang="ts">
	import { page } from '$app/stores';
	import { PUBLIC_URL } from '$env/static/public';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { trpc } from '$lib/client/trpc';
	import { browser } from '$app/environment';
	import { TRPCError } from '@trpc/server';
	import { toast } from 'svelte-sonner';

	let isYearly = false;

	const upgradeMutation = trpc().homePageRouter.upgradePlan.createMutation();
</script>

<section class="flex items-center justify-center mt-10 pb-10">
	<div
		class="p-4 sm:px-10 flex flex-col justify-center items-center text-base h-100vh mx-auto"
		id="pricing"
	>
		<div class="max-w-3xl text-center mx-auto z-20 relative p-2">
			<h1 class="block font-bold text-2xl md:text-3xl lg:text-4xl text-balance">
				Expand your org's capabilities
			</h1>
		</div>

		<div class="flex items-center space-x-2 my-4">
			<Label for="airplane-mode">Monthly</Label>
			<Switch id="airplane-mode" bind:checked={isYearly} />
			<Label for="airplane-mode">Yearly</Label>
		</div>
		<div class="isolate mx-auto grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none">
			<div class="ring-2 ring-primary rounded-3xl p-8 xl:p-10">
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
				<form method="post" action={`${PUBLIC_URL}/org/${$page.params.id}?/upgrade`}>
					<input class="hidden" name="period" value={isYearly ? 'yearly' : 'monthly'} />
					<Button
						type="button"
						on:click={async () =>
							$upgradeMutation
								.mutateAsync({
									orgId: $page.params.id,
									period: isYearly ? 'yearly' : 'monthly',
									returnURL: $page.url.toString()
								})
								.then(({ sessionUrl }) => {
									if (browser) {
										window.location.href = sessionUrl;
									}
								})
								.catch((err) => {
									if (err instanceof TRPCError) {
										toast.error(err.message);
									}
								})}
						aria-describedby="tier-extended"
						class="w-full shadow-sm  mt-6 block rounded-md py-2 px-3 text-center text-base font-medium leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
						>Subscribe</Button
					>
				</form>

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
