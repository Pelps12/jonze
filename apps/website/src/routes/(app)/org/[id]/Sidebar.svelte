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

	export { className as class };
</script>

<div class={cn('lg:h-[80vh] flex flex-col justify-between', className)}>
	<div class=" lg:py-4">
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
	</div>

	<Card.Root class="m-2 hidden lg:block">
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
</div>
