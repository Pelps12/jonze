<script lang="ts">
	import { onMount } from 'svelte';

	import Sidebar from './Sidebar.svelte';
	import Calculator from 'lucide-svelte/icons/calculator';
	import Calendar from 'lucide-svelte/icons/calendar';
	import CreditCard from 'lucide-svelte/icons/credit-card';
	import Settings from 'lucide-svelte/icons/settings';
	import Smile from 'lucide-svelte/icons/smile';
	import User from 'lucide-svelte/icons/user';
	import * as Command from '$lib/components/ui/command';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { cn } from '$lib/utils';
	import { FileText } from 'lucide-svelte';
	export let data;

	let commandBoxOpen = false;

	let currentOrg = data.user?.orgs.find((org) => org.id === $page.params.id);

	page.subscribe(() => {
		currentOrg = data.user?.orgs.find((org) => org.id === $page.params.id);
		console.log(currentOrg);
	});

	onMount(() => {
		function handleKeydown(e: KeyboardEvent) {
			if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				commandBoxOpen = !commandBoxOpen;
			}
		}

		document.addEventListener('keydown', handleKeydown);
		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<QueryClientProvider client={data.queryClient}>
	<div class="lg:grid lg:grid-cols-5">
		<aside class={cn('lg:h-[90vh] lg:sticky lg:top-0 lg:justify-between lg:flex lg:flex-col')}>
			<Sidebar class="" showSubscribe={currentOrg?.plan === 'standard'} />
		</aside>

		<div class="lg:col-span-4 border-t lg:border-l p-3">
			<slot />
		</div>
	</div>
</QueryClientProvider>

<Command.Dialog bind:open={commandBoxOpen}>
	<Command.Input placeholder="Type a command or search..." />
	<Command.List>
		<Command.Empty>No results found.</Command.Empty>
		<Command.Group heading="Suggestions">
			<a
				href={`/org/${$page.params.id}/events?newevent=true`}
				on:click={() => (commandBoxOpen = false)}
			>
				<Command.Item>
					<Calendar class="mr-2 h-4 w-4" />
					<span>Make Event</span>
				</Command.Item>
			</a>
			<a
				href={`/org/${$page.params.id}/plans?newplan=true`}
				on:click={() => (commandBoxOpen = false)}
			>
				<Command.Item>
					<Smile class="mr-2 h-4 w-4" />
					<span>Create Membership Plan</span>
				</Command.Item>
			</a>
			<a href={`/org/${$page.params.id}/forms/create`} on:click={() => (commandBoxOpen = false)}>
				<Command.Item>
					<FileText class="mr-2 h-4 w-4" />
					<span>Create Form</span>
				</Command.Item>
			</a>
		</Command.Group>
		<Command.Separator />
		<Command.Group heading="Settings">
			<a href={`/org/${$page.params.id}/settings`} on:click={() => (commandBoxOpen = false)}>
				<Command.Item>
					<Settings class="mr-2 h-4 w-4" />
					<span>Settings</span>
					<Command.Shortcut>⌘S</Command.Shortcut>
				</Command.Item>
			</a>
		</Command.Group>
	</Command.List>
</Command.Dialog>
