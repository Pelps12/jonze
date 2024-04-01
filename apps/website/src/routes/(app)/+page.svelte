<script lang="ts">
	import { browser } from '$app/environment';
	import { PUBLIC_URL } from '$env/static/public';
	import { Button } from '$lib/components/ui/button';
	import { mode } from 'mode-watcher';
	import { MetaTags } from 'svelte-meta-tags';
</script>

<!-- Hero -->

<MetaTags
	title="Jonze"
	description="Member management for campus orgs."
	openGraph={{
		url: PUBLIC_URL,
		title: 'Jonze',
		description: 'Member management for campus orgs.',
		images: [
			{
				url: 'https://ucarecdn.com/b49dfb27-3d2b-4b3f-a556-e0022c76d2fb/',
				width: 1000,
				height: 525,
				alt: 'Jonze Alt'
			}
		],
		siteName: 'Jonze'
	}}
	twitter={{
		handle: '@Pelps12',
		site: '@Pelps12',
		cardType: 'summary_large_image',
		title: 'Jonze',
		description: 'Member management for campus orgs.',
		image: 'https://ucarecdn.com/b49dfb27-3d2b-4b3f-a556-e0022c76d2fb/',
		imageAlt: 'Twitter image alt'
	}}
/>
<div
	class="lg:h-[80vh] xl:h-[90vh] relative overflow-hidden before:absolute before:top-0 before:start-1/2 before:bg-[url('/hero_bg.svg')] before:bg-no-repeat before:bg-top before:bg-cover before:w-full before:h-full before:-z-[1] before:transform before:-translate-x-1/2 dark:before:bg-[url('/hero_bg_dark.svg')]"
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
		<div class="mt-5 max-w-2xl text-center mx-auto z-20 relative">
			<h1 class="block font-bold text-4xl md:text-5xl lg:text-6xl">
				Organization management made
				<span class="bg-clip-text text-primary drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)]">easy</span
				>
			</h1>
		</div>
		<!-- End Title -->

		<div class="mt-5 max-w-3xl text-center mx-auto z-20 relative">
			<p class="text-lg">
				The all-in-one platform for handling member statistics and event data. Let your org focus on
				what matters most: <span class=" text-primary font-semibold">running</span>.
			</p>
		</div>

		<!-- Buttons -->
		<div class="mt-8 gap-3 flex justify-center z-20 relative">
			<Button variant="secondary" class="gap-2" href="https://github.com/Pelps12/diff">
				<svg
					class="flex-shrink-0 w-4.5 h-4.5"
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					fill="currentColor"
					viewBox="0 0 16 16"
				>
					<path
						d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"
					></path>
				</svg>
				Github
			</Button>

			<Button variant="secondary" class="gap-2" href="https://discord.gg/UCvyBgbspE">
				<svg
					class="flex-shrink-0 w-4.5 h-4.5"
					width="16"
					height="16"
					viewBox="0 -28.5 256 256"
					version="1.1"
					xmlns="http://www.w3.org/2000/svg"
					xmlns:xlink="http://www.w3.org/1999/xlink"
					preserveAspectRatio="xMidYMid"
					fill="#000000"
					><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
						id="SVGRepo_tracerCarrier"
						stroke-linecap="round"
						stroke-linejoin="round"
					></g><g id="SVGRepo_iconCarrier">
						<g>
							<path
								d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z"
								fill="#5865F2"
								fill-rule="nonzero"
							>
							</path>
						</g>
					</g></svg
				>
				Discord
			</Button>
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
<!-- End Hero -->

<div class="grid max-w-3xl gap-10 mx-auto md:grid-cols-2 lg:gap-16 my-10">
	<div class="flex flex-col items-center gap-2 text-center">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="w-12 h-12 rounded-lg bg-gray-100 p-3 dark:bg-gray-800"
		>
			<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
			<polyline points="16 7 22 7 22 13"></polyline>
		</svg>
		<div class="space-y-2">
			<h3 class="font-bold">Data Analytics</h3>
			<p class="text-sm">Track trends and measure engagement with advanced analytics tools.</p>
		</div>
	</div>
	<div class="flex flex-col items-center gap-2 text-center">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="w-12 h-12 rounded-lg bg-gray-100 p-3 dark:bg-gray-800"
		>
			<rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
			<line x1="16" x2="16" y1="2" y2="6"></line>
			<line x1="8" x2="8" y1="2" y2="6"></line>
			<line x1="3" x2="21" y1="10" y2="10"></line>
			<path d="m9 16 2 2 4-4"></path>
		</svg>
		<div class="space-y-2">
			<h3 class="font-bold">Event Tracking</h3>
			<p class="text-sm">
				Effortlessly manage events and capture attendance for seamless member experiences.
			</p>
		</div>
	</div>
	<div class="flex flex-col items-center gap-2 text-center">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="w-12 h-12 rounded-lg bg-gray-100 p-3 dark:bg-gray-800"
		>
			<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
			<circle cx="9" cy="7" r="4"></circle>
			<path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
			<path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
		</svg>
		<div class="space-y-2">
			<h3 class="font-bold">Member Insights</h3>
			<p class="text-sm">
				Gain valuable insights into member behavior and preferences to enhance their experience.
			</p>
		</div>
	</div>
	<div class="flex flex-col items-center gap-2 text-center">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="w-12 h-12 rounded-lg bg-gray-100 p-3 dark:bg-gray-800"
		>
			<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
			<polyline points="14 2 14 8 20 8"></polyline>
			<path d="m16 13-3.5 3.5-2-2L8 17"></path>
		</svg>
		<div class="space-y-2">
			<h3 class="font-bold">Customizable Reports</h3>
			<p class="text-sm">
				Create and share reports with stakeholders to showcase the impact of your community.
			</p>
		</div>
	</div>
</div>

{#if browser}
	<img
		src={$mode === 'dark'
			? 'https://r2.oluwapelps.com/demo_dark.png'
			: 'https://r2.oluwapelps.com/demo_light.png'}
		height={1363}
		width={923}
		class="mx-auto"
		alt="Demo"
	/>
{/if}

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
