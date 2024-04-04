<script lang="ts">
	import { createRender, createTable, Render, Subscribe } from 'svelte-headless-table';
	import Actions from './data-table-actions.svelte';
	import { readable } from 'svelte/store';
	import * as Table from '$lib/components/ui/table';
	import type { FormResponse, Member, OrgForm, User } from '@repo/db/types';
	export let members: (Member & {
		user: Omit<User, 'createdAt' | 'updatedAt' | 'id'>;
		additionalInfo: FormResponse | null;
	})[];
	export let organizationForm: OrgForm | undefined;
	type Payment = {
		id: string;
		amount: number;
		status: 'pending' | 'processing' | 'success' | 'failed' | 'refunded';
		email: string;
	};

	const table = createTable(readable(members));
	const columns = table.createColumns([
		table.column({
			accessor: (item) => item.user.firstName ?? '',
			header: 'First Name'
		}),
		table.column({
			accessor: (item) => item.user.lastName ?? '',
			header: 'Last Name'
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
								console.log(row.original.additionalInfo.response);
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
