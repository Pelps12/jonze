<script lang="ts">
	import { page } from '$app/stores';
	import { trpc } from '$lib/client/trpc';
	import type { RouterOutput } from '$lib/server/trpc/routes';
	import { json2csv } from 'json-2-csv';
	import DataTable from './data-table.svelte';
	import { Button } from '$lib/components/ui/button';
	import { FileDown } from 'lucide-svelte';
	import LoadingTable from '$lib/components/custom/LoadingTable.svelte';

	const result = trpc().eventRouter.getEventDetails.createQuery({
		orgId: $page.params.id,
		eventId: $page.params.eventId
	});

	const handleExport = async (data: any[], filename: string) => {
		const csv = json2csv(data, {
			expandNestedObjects: true,
			expandArrayObjects: true
		});

		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

		// Create a link element for the download
		const link = document.createElement('a');
		const url = URL.createObjectURL(blob);
		link.setAttribute('href', url);
		link.setAttribute('download', filename);
		link.style.visibility = 'hidden';

		// Append to the document and trigger the download
		document.body.appendChild(link);
		link.click();

		// Clean up
		document.body.removeChild(link);
		window.URL.revokeObjectURL(url);
	};
</script>

<div class="flex justify-between">
	<h2 class="text-xl font-semibold">Event Details of "{$result.data?.event?.name ?? '...'}"</h2>
	<Button
		variant="outline"
		disabled={!$result.data}
		on:click={() =>
			handleExport(
				$result.data?.event?.attendances ?? [],
				`${$result.data?.event?.name}_attendance.csv`
			)}><FileDown class="h-4 w-4 mr-2" /><span class="hidden sm:block">Export</span></Button
	>
</div>
{#if $result.data}
	<div class="container mx-auto py-10">
		<DataTable attendants={$result.data.event.attendances} form={$result.data.event.form} />
	</div>
{:else}
	<LoadingTable />
{/if}
