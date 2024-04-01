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

	const frameworks = [
		{
			value: 'sveltekit',
			label: 'SvelteKit'
		},
		{
			value: 'next.js',
			label: 'Next.js'
		},
		{
			value: 'nuxt.js',
			label: 'Nuxt.js'
		},
		{
			value: 'remix',
			label: 'Remix'
		},
		{
			value: 'astro',
			label: 'Astro'
		}
	];

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

<form
	method="post"
	data-sveltekit-keepfocus
	action="?/searchMember"
	use:enhance={({ formElement, formData, action, cancel, submitter }) => {
		// `formElement` is this `<form>` element
		// `formData` is its `FormData` object that's about to be submitted
		// `action` is the URL to which the form is posted
		// calling `cancel()` will prevent the submission
		// `submitter` is the `HTMLElement` that caused the form to be submitted

		return async ({ result, update }) => {
			if (result.type == 'success') {
				//@ts-ignore
				userList = result.data?.members;
			}
			// `result` is an `ActionResult` object
			// `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
		};
	}}
>
	<Label for="email">Email</Label>
	<div class="flex items-center gap-2">
		<Input id="email" type="text" name="invitee_email" class="col-span-2 h-10" />
		<Button type="submit" variant="outline" size="icon">
			<Search class="h-4 w-4" />
		</Button>
	</div>

	{#each userList as member}
		<form
			class="w-full shadow-md my-2 text-sm py-3 flex justify-between items-center"
			method="post"
			data-sveltekit-keepfocus
			action="?/createAdmin"
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
</form>
