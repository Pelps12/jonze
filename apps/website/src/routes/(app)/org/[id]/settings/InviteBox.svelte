<script lang="ts">
	import Check from 'lucide-svelte/icons/check';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { writable } from 'svelte/store';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Search, PlusCircle } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { trpc } from '$lib/client/trpc';

	export let closeForm: () => void;

	let invitee_email = '';

	const getMemberMut = trpc().settingsRouter.getMember.createMutation();
	const createAdminMut = trpc().settingsRouter.createAdmin.createMutation();
	const utils = trpc().createUtils();

	let open = false;

	let userList: {
		memId: string;
		userEmail: string;
	}[] = [];

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}
</script>

<Label for="email">Email</Label>
<div class="flex items-center gap-2">
	<Input
		id="email"
		type="text"
		name="invitee_email"
		bind:value={invitee_email}
		class="col-span-2 h-10"
		on:keydown={(e) =>
			e.key === 'Enter' &&
			$getMemberMut
				.mutateAsync({
					orgId: $page.params.id,
					email: invitee_email
				})
				.then(({ members }) => {
					userList = members;
				})}
	/>
	<Button
		type="button"
		on:click={() =>
			$getMemberMut
				.mutateAsync({
					orgId: $page.params.id,
					email: invitee_email
				})
				.then(({ members }) => {
					userList = members;
				})}
		variant="outline"
		size="icon"
	>
		<Search class="h-4 w-4" />
	</Button>
</div>

{#each userList as member}
	<form
		class="w-full shadow-md my-2 text-sm py-3 px-2 flex justify-between items-center"
		method="post"
		data-sveltekit-keepfocus
		action="?/createAdmin"
		on:submit|preventDefault={(e) =>
			$createAdminMut
				.mutateAsync({
					orgId: $page.params.id,
					memberId: member.memId
				})
				.then(() => {
					utils.settingsRouter.getSettings.invalidate();
					closeForm();
				})}
	>
		<div>
			{member.userEmail}
		</div>
		<input value={member.memId} name="memId" class="hidden" />

		<Button type="submit" variant="outline" size="icon">
			<PlusCircle class=" h-4 w-4" />
		</Button>
	</form>
{/each}

{#if userList.length == 0}
	<div class="text-center p-2 text-xl font-semibold">No Members 🥲</div>
{/if}
