<script lang="ts">
	import type { RouterOutput } from '$lib/server/trpc/routes';
	import { formatName } from '$lib/utils';
	import { Render, Subscribe, createRender, createTable } from 'svelte-headless-table';
	import * as Table from '$lib/components/ui/table';
	import Link from './link.svelte';

	import { readable } from 'svelte/store';

	export let data: RouterOutput['formRouter']['getFormResponses'];

	const table = createTable(readable(data.form?.responses ?? []));
	const columns = table.createColumns([
		table.column({
			accessor: (item) => item.member.user,
			header: 'User',
			cell: ({ value, row }) => {
				if (row.isData()) {
					return createRender(Link, {
						value: formatName(value.firstName, value.lastName),
						id: row.original.memId ?? ''
					});
				}
				return '';
			}
		}),
		...(data.form?.form ?? [])?.map((formField) =>
			table.column({
				accessor: (item) =>
					item.response.find((element) => element.label === formField.label)?.response ?? '',
				header: formField.label
			})
		)
	]);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs } = table.createViewModel(columns);
</script>

<div class="rounded-md border">
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
