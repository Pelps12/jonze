<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Loader2Icon } from 'lucide-svelte';

	import { applyAction, enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import { goto } from '$app/navigation';
	export let form: ActionData;

	let formStatus: 'idle' | 'submitting' | 'submitted' = 'idle';
</script>

<div class="w-[100vw] h-[100vh] flex justify-center items-center">
	<Card.Root class="w-[350px]">
		<Card.Header>
			<Card.Title>Create org</Card.Title>
			<Card.Description>Add your organization in one-click.</Card.Description>
		</Card.Header>
		<form
			method="post"
			action="?/create"
			use:enhance={() => {
				// `formElement` is this `<form>` element
				// `formData` is its `FormData` object that's about to be submitted
				// `action` is the URL to which the form is posted
				// calling `cancel()` will prevent the submission
				// `submitter` is the `HTMLElement` that caused the form to be submitted
				formStatus = 'submitting';

				return async ({ result, update }) => {
					// `result` is an `ActionResult` object
					// `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
					formStatus = 'submitted';
					if (result.type === 'redirect') {
						goto(result.location);
					} else {
						await applyAction(result);
					}
				};
			}}
		>
			<Card.Content>
				<div class="grid w-full items-center gap-4">
					<div class="flex flex-col space-y-1.5">
						<Label for="name">Name</Label>
						<Input id="name" name="name" placeholder="Name of your org" />
					</div>
				</div>
			</Card.Content>
			<Card.Footer class="flex justify-end">
				<Button type="submit" disabled={formStatus === 'submitting'}>
					{#if formStatus !== 'submitting'}
						Create
					{:else}
						<Loader2Icon class="mr-2 h-4 w-4 animate-spin" />
						Creating
					{/if}
				</Button>
			</Card.Footer>
		</form>
	</Card.Root>
</div>
