<script lang="ts">
	import { createRender, createTable, Render, Subscribe } from 'svelte-headless-table';
	import Actions from './data-table-actions.svelte';
	import { readable } from 'svelte/store';
	import * as Table from '$lib/components/ui/table';
	import type { FormResponse, Member, OrgForm, User } from '@repo/db/types';
	import { formatName } from '$lib/utils';

	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import { mediaQuery } from 'svelte-legos';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/stores';
	import { goto, invalidate, invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';

	const isDesktop = mediaQuery('(min-width: 768px)');

	let count = 20;
	$: perPage = $isDesktop ? 3 : 8;
	$: siblingCount = $isDesktop ? 1 : 0;

	export let data: PageData;

	const { members, organizationForm, pagination } = data;

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

	const handlePagination = async (direction: 'prev' | 'next') => {
		const newUrl = new URL($page.url);
		if (direction == 'prev' && pagination.prevCursor) {
			newUrl.searchParams.set('before', pagination.prevCursor);
			newUrl.searchParams.delete('after');
		} else if (direction == 'next' && pagination.nextCursor) {
			newUrl.searchParams.set('after', pagination.nextCursor);
			newUrl.searchParams.delete('before');
		}

		window.location.href = newUrl.toString();
	};
</script>

<div class="flex justify-end gap-2">
	<Button
		disabled={!data.pagination.prevCursor}
		variant="outline"
		on:click={() => handlePagination('prev')}
	>
		<ChevronLeft class="h-4 w-4" />
		<span class="hidden sm:block">Previous</span>
	</Button>

	<Button
		disabled={!data.pagination.nextCursor}
		variant="outline"
		on:click={() => handlePagination('next')}
	>
		<span class="hidden sm:block">Next</span>
		<ChevronRight class="h-4 w-4" />
	</Button>
</div>

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

<div class="flex justify-end gap-2">
	<Button
		disabled={!data.pagination.prevCursor}
		variant="outline"
		on:click={() => handlePagination('prev')}
	>
		<ChevronLeft class="h-4 w-4" />
		<span class="hidden sm:block">Previous</span>
	</Button>

	<Button
		disabled={!data.pagination.nextCursor}
		variant="outline"
		on:click={() => handlePagination('next')}
	>
		<span class="hidden sm:block">Next</span>
		<ChevronRight class="h-4 w-4" />
	</Button>
</div>
