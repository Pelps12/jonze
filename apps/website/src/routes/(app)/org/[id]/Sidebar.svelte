<script lang="ts">
	import { goto, preloadData, pushState } from '$app/navigation';
	import { page } from '$app/stores';
	import { Badge } from '$lib/components/ui/badge';
	import { Button, buttonVariants, type ButtonEvents } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import Subscription from '$lib/components/custom/Subscription.svelte';
	import { cn } from '$lib/utils';
	import {
		CalendarIcon,
		FileText,
		FolderIcon,
		HomeIcon,
		SettingsIcon,
		TrendingUp,
		UsersIcon
	} from 'lucide-svelte';
	import { twJoin } from 'tailwind-merge';
	let className: string | null | undefined = undefined;
	import { mode } from 'mode-watcher';
	import * as Tooltip from '$lib/components/ui/tooltip';

	export { className as class };

	export let showSubscribe: boolean;
</script>

<div class=" px-3 lg:py-2 flex lg:block">
	<Button
		class="w-full justify-center lg:justify-start gap-2"
		variant="ghost"
		href="/org/{$page.params.id}"
	>
		<HomeIcon class="h-4 w-4" />
		<span class="hidden lg:block">Home</span>
	</Button>
	<Button
		class="w-full justify-center lg:justify-start gap-2"
		href="/org/{$page.params.id}/events"
		variant="ghost"
	>
		<CalendarIcon class="h-4 w-4" />
		<span class="hidden lg:block">Events</span>
	</Button>
	<Button
		class="w-full justify-center lg:justify-start gap-2"
		href="/org/{$page.params.id}/members"
		variant="ghost"
	>
		<UsersIcon class="h-4 w-4" />
		<span class="hidden lg:block">Members</span>
	</Button>
	<Button
		class="w-full justify-center lg:justify-start gap-2"
		href="/org/{$page.params.id}/plans"
		variant="ghost"
	>
		<TrendingUp class={twJoin('h-4 w-4 ')} />
		<span class="hidden lg:block">Plans</span>
		<Badge class="hidden lg:block" variant="outline">Alpha</Badge>
	</Button>
	<Button
		class="w-full justify-center lg:justify-start gap-2"
		href="/org/{$page.params.id}/forms"
		variant="ghost"
	>
		<FileText class="h-4 w-4" />
		<span class="hidden lg:block">Forms</span>
	</Button>
	<Button
		class="w-full justify-center lg:justify-start gap-2"
		href="/org/{$page.params.id}/settings"
		variant="ghost"
	>
		<SettingsIcon class="h-4 w-4" />
		<span class="hidden lg:block">Settings</span>
	</Button>
</div>

<div class="m-2 hidden lg:block">
	<div class="mx-auto w-full">
		<Tooltip.Root>
			<Tooltip.Trigger asChild let:builder>
				<Button
					builders={[builder]}
					class="my-2"
					size="icon"
					variant="outline"
					href="https://github.com/Pelps12/jonze"
				>
					{#if $mode === 'light'}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="w-4 h-4"
							viewBox="0 0 1024 1024"
							fill="none"
						>
							<path
								fill-rule="evenodd"
								clip-rule="evenodd"
								d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
								transform="scale(64)"
								fill="#1B1F23"
							/>
						</svg>
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 98 96"
							><path
								fill-rule="evenodd"
								clip-rule="evenodd"
								d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
								fill="#fff"
							/></svg
						>
					{/if}
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content>
				<p class="max-w-xs">
					Jonze is open-source and open-contribution. Feel free to drop a pull request
				</p>
			</Tooltip.Content>
		</Tooltip.Root>

		<Tooltip.Root>
			<Tooltip.Trigger asChild let:builder>
				<Button
					builders={[builder]}
					class="my-2"
					size="icon"
					variant="outline"
					href="https://discord.gg/f9gecBpHJ5"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						xmlns:xlink="http://www.w3.org/1999/xlink"
						class="h-4 w-4"
						viewBox="0 -28.5 256 256"
						version="1.1"
						preserveAspectRatio="xMidYMid"
					>
						<g>
							<path
								d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z"
								fill="#5865F2"
								fill-rule="nonzero"
							>
							</path>
						</g>
					</svg>
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content>
				<p class="max-w-xs">
					We have a community discord server if you run into any issues while working with Jonze or
					you just wanna hang out 🙂.
				</p>
			</Tooltip.Content>
		</Tooltip.Root>
	</div>

	{#if showSubscribe}
		<Card.Root>
			<Card.Header class="p-2 pt-0 md:p-4">
				<Card.Title>Upgrade to Pro</Card.Title>
				<Card.Description>
					Unlock all features and get unlimited access to our support team.
				</Card.Description>
			</Card.Header>
			<Card.Content class="p-2 pt-0 md:p-4 md:pt-0">
				<Dialog.Root>
					<Dialog.Trigger class={cn(buttonVariants({ size: 'sm' }), 'w-full')}
						>Subscribe</Dialog.Trigger
					>
					<Dialog.Content class="w-full">
						<Subscription />
					</Dialog.Content>
				</Dialog.Root>
			</Card.Content>
		</Card.Root>
	{/if}
</div>
