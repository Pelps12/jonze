<script lang="ts">
	import { PUBLIC_ENVIRONMENT } from '$env/static/public';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Save, Settings, Trash } from 'lucide-svelte';
	import posthog from 'posthog-js';
	import { onMount } from 'svelte';

	export let handleSave: () => void;
	export let handleDelete: () => void;
	export let id: number;

	export let handleOpenSettings: (id: number) => void = (id: number) => {};

	let newFormFlagEnabled = PUBLIC_ENVIRONMENT === 'dev';
	onMount(() => {
		posthog.onFeatureFlags(() => {
			if (posthog.isFeatureEnabled('new-form-validation')) {
				newFormFlagEnabled = true;
			}
		});
	});
</script>

<Card.Root class="w-full relative mx-auto">
	<Card.Header>
		<div class="absolute top-0 right-0 m-4 flex gap-2">
			{#if newFormFlagEnabled}
				<Button
					variant="secondary"
					size="icon"
					class="h-6 w-6"
					on:click={() => handleOpenSettings(id)}
				>
					<Settings class="w-4 h-4" />
				</Button>
			{/if}

			<Button variant="destructive" size="icon" class="h-6 w-6" on:click={() => handleDelete()}>
				<Trash class="w-4 h-4" />
			</Button>
		</div>
	</Card.Header>
	<Card.Content>
		<slot />
	</Card.Content>
</Card.Root>
