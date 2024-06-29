<script lang="ts">
	import { derived } from 'svelte/store';
	import type { PageData } from './$types';

	import { page } from '$app/stores';
	import { trpc } from '$lib/client/trpc';
	import DataTable from './data-table.svelte';
	export let data: PageData;

	console.log(data);

	const queryParams = derived(page, ($page) => ({
		orgId: $page.params.id,
		formId: $page.params.formId,
		eventId: $page.url.searchParams.get('eventId'),
		memberId: $page.url.searchParams.get('memId')
	}));

	const responsesQuery = trpc().formRouter.getFormResponses.createQuery($queryParams);
</script>

{#if $responsesQuery.data}
	<DataTable data={$responsesQuery.data} />
{/if}
