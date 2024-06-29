<script lang="ts">
	import { page } from '$app/stores';
	import { trpc } from '$lib/client/trpc';
	import DataTable from './data-table.svelte';

	const result = trpc().eventRouter.getEventDetails.createQuery({
		orgId: $page.params.id,
		eventId: $page.params.eventId
	});
</script>

{#if $result.data}
	<h2 class="text-xl font-semibold">Event Details of "{$result.data.event.name}"</h2>

	<div class="container mx-auto py-10">
		<DataTable attendants={$result.data.event.attendances} form={$result.data.event.form} />
	</div>
{/if}
