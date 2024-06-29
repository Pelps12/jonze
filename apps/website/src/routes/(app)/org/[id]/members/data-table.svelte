<script lang="ts">
	import { createRender, createTable, Render, Subscribe } from 'svelte-headless-table';
	import Actions from './data-table-actions.svelte';
	import { readable, writable } from 'svelte/store';
	import * as Table from '$lib/components/ui/table';
	import { formatName } from '$lib/utils';

	import { mediaQuery } from 'svelte-legos';

	import type { RouterOutput } from '$lib/server/trpc/routes';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	const isDesktop = mediaQuery('(min-width: 768px)');

	let count = 20;
	$: perPage = $isDesktop ? 3 : 8;
	$: siblingCount = $isDesktop ? 1 : 0;

	export let data: RouterOutput['memberRouter']['getMembers'];

	const { members, organizationForm } = data;

	function isMonotonicallyIncreasing(arr: string[]): boolean {
		for (let i = 1; i < arr.length; i++) {
			if (arr[i] > arr[i - 1]) {
				return false;
			}
		}
		return true;
	}

	onMount(() => {
		if (isMonotonicallyIncreasing(members.map((member) => member.id))) {
			toast.info('NOICEEEE');
		} else {
			toast.error('Not monotic');
		}
	});

	const table = createTable(readable(members));
	const columns = table.createColumns([
		table.column({
			accessor: (item) => formatName(item.user.firstName, item.user.lastName),
			header: 'Name'
		}),
		table.column({
			accessor: (item) => item.user.email,
			header: 'Email'
		}),
		table.column({
			accessor: (item) => item.createdAt,
			header: 'Joined',
			cell: ({ value }) => {
				return value.toLocaleString('en-US', {
					month: 'short',
					day: 'numeric',
					hour: 'numeric',
					minute: '2-digit',
					second: 'numeric',
					hour12: true
				});
			}
		}),
		...(organizationForm
			? organizationForm.form.map((field) => {
					return table.display({
						id: field.label,
						header: () => {
							return field.label;
						},
						cell: ({ row }) => {
							if (row.isData() && row.original && row.original.additionalInfo) {
								const val = row.original.additionalInfo.response?.find(
									(element) => element.label === field.label
								)?.response;
								return typeof val === 'string' ? val : val !== undefined ? val[0] : '';
							}
							return '';
						},
						plugins: {
							sort: {
								disable: true
							}
						}
					});
				})
			: []),
		table.display({
			id: 'actions',
			header: () => {
				return '';
			},
			cell: ({ row }) => {
				if (row.isData() && row.original) {
					return createRender(Actions, {
						memberId: row.original.id
					});
				}
				return '';
			},
			plugins: {
				sort: {
					disable: true
				}
			}
		})
	]);
	const { headerRows, pageRows, tableAttrs, tableBodyAttrs } = table.createViewModel(columns);
</script>

<!-- Options -->

<div class="rounded-md border my-4">
	<Table.Root {...$tableAttrs} class="rounded-md">
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
