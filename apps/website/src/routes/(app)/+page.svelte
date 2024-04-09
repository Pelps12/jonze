<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { PUBLIC_URL } from '$env/static/public';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { ChevronRight } from 'lucide-svelte';
	import { mode } from 'mode-watcher';
	import { onMount } from 'svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import { toast } from 'svelte-sonner';

	const payment_success = $page.url.searchParams.has('payment_success');
	const attendance_success = $page.url.searchParams.get('attendance_success');
	onMount(() => {
		if (payment_success) {
			toast.success('Payment Successful');
		}

		if (attendance_success) {
			if (attendance_success === 'true') {
				toast.success('Attendance Marked');
			}
		}

		if (window.location.hash !== '') {
			document.getElementById(window.location.hash)?.scrollIntoView({
				behavior: 'smooth'
			});
		}
	});
</script>

<!-- Hero -->

<div
	class="lg:h-[80vh] mb-20 xl:h-[90vh] relative overflow-hidden before:absolute before:top-0 before:start-1/2 before:bg-[url('/hero_bg.svg')] before:bg-no-repeat before:bg-top before:bg-cover before:w-full before:h-full before:-z-[1] before:transform before:-translate-x-1/2 dark:before:bg-[url('/hero_bg_dark.svg')]"
>
	<div class="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
		<!-- Announcement Banner -->
		<div class="flex justify-center">
			<Button
				variant="outline"
				disabled
				class="inline-flex items-center gap-x-2 bg-white border border-gray-200 text-sm text-gray-800 p-2  rounded-full transition hover:border-gray-300 "
			>
				Memberships in beta. More metrics on the way
			</Button>
		</div>
		<!-- End Announcement Banner -->

		<!-- Title -->
		<div class="mt-5 max-w-3xl text-center mx-auto z-20 relative">
			<h1 class="block font-bold text-4xl md:text-5xl lg:text-6xl">
				<span class="bg-clip-text text-primary drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)]"
					>Streamlining</span
				>
				organization management
			</h1>
		</div>
		<!-- End Title -->

		<div class="mt-5 max-w-3xl text-center mx-auto z-20 relative">
			<p class="text-lg leading-8">
				Organize your member information such as attendance, surveys and dues seamlessly so you can
				focus on what matters most to your org: <span class=" text-primary font-semibold"
					>running</span
				>
			</p>
		</div>

		<!-- Buttons -->
		<div class="mt-8 gap-3 flex justify-center z-20 relative">
			<Button href="/org/create" class="gap-2">Get Started <ChevronRight class="h-4 w-4" /></Button>
		</div>
		<!-- End Buttons -->
	</div>

	<div class="custom-shape-divider-bottom-1707505390">
		<svg
			data-name="Layer 1"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 1200 120"
			preserveAspectRatio="none"
			class="fill-background stroke-1 z-[-99]"
		>
			<path
				d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
				class="shape-fill"
			></path>
		</svg>
	</div>
</div>
<div class="max-w-5xl left-0 right-0 w-full mx-auto -translate-y-[20%] z-30 mt-10 -mb-20">
	<div
		class="w-full h-11 bg-background rounded-t-lg border-2 border-black dark:border-white flex justify-start items-center space-x-1.5 px-3"
	>
		<span class="w-3 h-3 rounded-full bg-black dark:bg-white"></span>
		<span class="w-3 h-3 rounded-full bg-black dark:bg-white"></span>
		<span class="w-3 h-3 rounded-full bg-black dark:bg-white"></span>
	</div>
	<div class="border-2 border-black dark:border-white border-t-0 w-full max-h-[50rem]">
		<img
			src="https://ucarecdn.com/587b4d80-a1cf-452e-9c29-2c998eb3a762/-/preview/1000x562/"
			alt=""
			class="mx-auto z-60"
		/>
	</div>
</div>
<!-- End Hero -->

<!-- Title -->

<div class="p-3 divide-y lg:divide-y-0" id="attendance">
	<div class="mt-5 text-center mx-auto z-20 relative grid lg:grid-cols-2">
		<div class="my-auto">
			<h1 class="block font-bold text-2xl md:text-3xl lg:text-4xl my-5">
				<span class="text-primary">One-Click</span> Member Attendance
			</h1>
			<p class="text-md lg:text-lg max-w-xl mx-auto my-5 text-center leading-loose">
				Your members shouldn't need to fill out redundant information like school email, netID or
				class on every meeting's attendance link.
			</p>

			<Button
				href={`http://dev.jonze.co/event/attendance/evt_KYJrLfKkgiEEGgjo?callbackUrl=${PUBLIC_URL}#attendance`}
				>Demo</Button
			>
		</div>
		<div>
			<div class="max-w-2xl mx-auto my-10">
				<div
					class="w-full h-11 rounded-t-lg border-2 border-black dark:border-white flex justify-start items-center space-x-1.5 px-3"
				>
					<span class="w-3 h-3 rounded-full bg-black dark:bg-white"></span>
					<span class="w-3 h-3 rounded-full bg-black dark:bg-white"></span>
					<span class="w-3 h-3 rounded-full bg-black dark:bg-white"></span>
				</div>
				<div class="border-2 border-black dark:border-white border-t-0 w-full max-h-96">
					{#if browser}
						<img
							src={$mode === 'dark'
								? 'https://ucarecdn.com/c119f79c-6002-4f1e-84f9-bc8646e1baee/-/preview/1000x496/'
								: 'https://ucarecdn.com/c119f79c-6002-4f1e-84f9-bc8646e1baee/-/preview/1000x496/'}
							class="mx-auto object-fill z-[-99] relative"
							alt="Demo"
						/>
					{/if}
				</div>
			</div>
		</div>
	</div>
	<div class="mt-5 text-center mx-auto z-20 relative grid lg:grid-cols-2">
		<div>
			<div class="max-w-2xl mx-auto my-10">
				<div
					class="w-full h-11 rounded-t-lg border-2 border-black dark:border-white flex justify-start items-center space-x-1.5 px-3"
				>
					<span class="w-3 h-3 rounded-full bg-black dark:bg-white"></span>
					<span class="w-3 h-3 rounded-full bg-black dark:bg-white"></span>
					<span class="w-3 h-3 rounded-full bg-black dark:bg-white"></span>
				</div>
				<div class="border-2 border-black dark:border-white border-t-0 w-full max-h-96">
					{#if browser}
						<img
							src={$mode === 'dark'
								? 'https://ucarecdn.com/d471ea95-1cf7-41f2-be27-54c7d5623212/-/preview/1000x502/'
								: 'https://ucarecdn.com/d471ea95-1cf7-41f2-be27-54c7d5623212/-/preview/1000x502/'}
							class="mx-auto object-fill"
							alt="Demo"
						/>
					{/if}
				</div>
			</div>
		</div>

		<div class="my-auto">
			<h1 class="block font-bold text-2xl md:text-3xl lg:text-4xl my-5">
				<span class="text-primary">Contextual</span> Form Responses
			</h1>
			<p class="text-md lg:text-lg max-w-xl mx-auto my-5 text-center leading-loose">
				From surveys to RSVPs, forms are critical to your org. However, standalone forms make it
				hard to quickly recognize the member, their contribution and status in the org. Start
				understanding the member behind the response.
			</p>
		</div>
	</div>

	<div class="mt-5 text-center mx-auto z-20 relative grid lg:grid-cols-2">
		<div class="my-auto">
			<h1 class="block font-bold text-2xl md:text-3xl lg:text-4xl my-5">
				<span class="text-primary">Easy</span> Org Analytics
			</h1>
			<p class="text-md lg:text-lg max-w-xl mx-auto my-5 text-center leading-loose">
				Some questions don't need to take up that your time. Quickly analyze event performance and
				member behavior to better iterate on things
			</p>
		</div>
		<div>
			<div class="max-w-2xl mx-auto my-10">
				<Card.Root class="my-6">
					<Card.Content class="p-6">
						<h3 class="text-2xl font-semibold leading-loose">
							How many <span class="text-primary">paid members</span> do we have?
						</h3>
					</Card.Content>
				</Card.Root>
				<Card.Root class="my-6">
					<Card.Content class="p-6">
						<h3 class="text-2xl font-semibold leading-loose">
							What was the <span class="text-primary">turnout</span> of the last meeting?
						</h3>
					</Card.Content>
				</Card.Root>
				<Card.Root class="my-6">
					<Card.Content class="p-6">
						<h3 class="text-2xl font-semibold leading-loose">
							Have they completed their <span class="text-primary">volunteer hours</span>?
						</h3>
					</Card.Content>
				</Card.Root>
				<Card.Root class="my-6">
					<Card.Content class="p-6">
						<h3 class="text-2xl font-semibold leading-loose">
							Who are our most <span class="text-primary">active members</span>?
						</h3>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	</div>
</div>

<style>
	.custom-shape-divider-bottom-1707505390 {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		overflow: hidden;
		line-height: 0;
		transform: rotate(180deg);
	}

	.custom-shape-divider-bottom-1707505390 svg {
		position: relative;
		display: block;
		margin-top: -1px;
		filter: blur(0.5px);
		width: calc(100% + 1.3px);
		height: 217px;
	}
</style>
