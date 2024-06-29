<script lang="ts">
	import { mediaQuery } from 'svelte-legos';
	import * as Table from '$lib/components/ui/table';
	import { createRender, createTable, Render, Subscribe } from 'svelte-headless-table';
	import { readable } from 'svelte/store';
	import Link from './link.svelte';
	import type { RouterOutput } from '$lib/server/trpc/routes';
	export let member: RouterOutput['memberRouter']['getMember']['member'];

	const table = createTable(readable(member.attendances));
	const columns = table.createColumns([
		table.column({
			accessor: (item) => item.event.name,
			header: 'Event Name',
			cell: ({ value, row }) => {
				if (row.isData()) {
					return createRender(Link, {
						value,
						id: row.original.eventId
					});
				}
				return '';
			}
		}),
		table.column({
			accessor: (item) => item.createdAt,
			header: 'Attended At',
			cell: ({ value }) => {
				return value.toLocaleString('en-US', {
					month: 'short',
					day: 'numeric',
					hour: 'numeric',
					year: 'numeric',
					minute: '2-digit',
					second: 'numeric',
					hour12: true
				});
			}
		})
	]);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs } = table.createViewModel(columns);

	let open = false;

	let updateModalOpen = false;

	const isDesktop = mediaQuery('(min-width: 768px)');
</script>

<div class="rounded-md border my-4">
	<Table.Root {...$tableAttrs}>
		<Table.Header>
			{#each $headerRows as headerRow}
				<Subscribe rowAttrs={headerRow.attrs()}>
					<Table.Row>
						{#each headerRow.cells as cell (cell.id)}
							<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()}>
								<Table.Head {...attrs}>
									<Render of={cell.render()} />
								</Table.Head>
							</Subscribe>
						{/each}
					</Table.Row>
				</Subscribe>
			{/each}
		</Table.Header>
		<Table.Body {...$tableBodyAttrs}>
			{#each $pageRows as row (row.id)}
				<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
					<Table.Row {...rowAttrs}>
						{#each row.cells as cell (cell.id)}
							<Subscribe attrs={cell.attrs()} let:attrs>
								<Table.Cell {...attrs}>
									<Render of={cell.render()} />
								</Table.Cell>
							</Subscribe>
						{/each}
					</Table.Row>
				</Subscribe>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
