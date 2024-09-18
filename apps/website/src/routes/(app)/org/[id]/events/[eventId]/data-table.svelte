<script lang="ts">
	import { createRender, createTable, Render, Subscribe } from 'svelte-headless-table';
	import Actions from './data-table-actions.svelte';
	import { readable } from 'svelte/store';
	import * as Table from '$lib/components/ui/table';
	import type { Attendance, FormResponse, Member, OrgForm, User } from '@repo/db/types';
	import Link from './link.svelte';
	import { formatName } from '$lib/utils';
	export let attendants: (Attendance & {
		member: Member & {
			user: Omit<User, 'createdAt' | 'updatedAt' | 'id'>;
		};
		response: FormResponse | null;
	})[];
	type Payment = {
		id: string;
		amount: number;
		status: 'pending' | 'processing' | 'success' | 'failed' | 'refunded';
		email: string;
	};

	export let form: OrgForm | null;

	const table = createTable(readable(attendants));
	const columns = table.createColumns([
		table.column({
			accessor: (item) => formatName(item.member.user.firstName, item.member.user.lastName),
			header: 'Name',
			cell: ({ value, row }) => {
				if (row.isData()) {
					return createRender(Link, {
						value: value,
						id: row.original.memId ?? ''
					});
				}
				return '';
			}
		}),
		table.column({
			accessor: (item) => item.member.user.email,
			header: 'Email'
		}),
		table.column({
			accessor: (item) => item.createdAt,
			header: 'Check In',
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
		table.column({
			accessor: (item) => item.updatedAt,
			header: 'Check Out',
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
		table.display({
			id: 'actions',
			header: () => {
				return '';
			},
			cell: ({ row }) => {
				if (row.isData() && form && row.original.response) {
					return createRender(Actions, {
						memId: row.original.response.memId
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
