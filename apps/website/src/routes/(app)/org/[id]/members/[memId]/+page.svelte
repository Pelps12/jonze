<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { ChevronDown, CopyIcon, Pencil, PlusCircle, TrashIcon } from 'lucide-svelte';
	import * as Drawer from '$lib/components/ui/drawer';
	import * as Dialog from '$lib/components/ui/dialog';
	import { mediaQuery } from 'svelte-legos';
	import * as Table from '$lib/components/ui/table';
	import * as Avatar from '$lib/components/ui/avatar';
	import { createRender, createTable, Render, Subscribe } from 'svelte-headless-table';
	import { readable } from 'svelte/store';
	import Link from './link.svelte';
	import MembershipForm from './MembershipForm.svelte';
	import { page } from '$app/stores';

	export let data: PageData;

	const table = createTable(readable(data.member.attendances));
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

	const isDesktop = mediaQuery('(min-width: 768px)');
</script>

<Card.Root class="max-w-md">
	<Card.Header>
		<Card.Title>Member</Card.Title>
	</Card.Header>
	<Card.Content class="grid gap-6 ">
		<div class="flex items-center justify-between space-x-4 relative">
			<div class="flex items-center space-x-4">
				<Avatar.Root>
					<Avatar.Image src={data.member.user.profilePictureUrl} alt={data.member.user.firstName} />
					<Avatar.Fallback>U</Avatar.Fallback>
				</Avatar.Root>
				<div>
					<p class="text-sm font-medium leading-none">
						{data.member.user.firstName}
						{data.member.user.lastName}
					</p>
					<p class="text-sm text-muted-foreground">{data.member.user.email}</p>
				</div>
			</div>

			<div class="ml-auto absolute right-0 text-sm self-center flex flex-col items-end">
				<div>Joined</div>
				<div>
					{data.member.createdAt.toLocaleString('en-US', {
						month: 'short',
						day: 'numeric',
						hour: 'numeric',
						minute: 'numeric'
					})}
				</div>
			</div>
		</div>
	</Card.Content>

	<Card.Content class="flex gap-2 items-center my-2 py-0">
		<p class="text-md font-medium leading-none">Membership Plan</p>
		{#await data.plans}
			<Button disabled size="icon" class="w-6 h-6">
				<Pencil class="w-4 h-4" />
			</Button>
		{:then plans}
			{#if $isDesktop}
				<Dialog.Root bind:open>
					<Dialog.Trigger asChild let:builder>
						<Button size="icon" class="w-6 h-6" builders={[builder]}>
							<Pencil class="w-4 h-4" />
						</Button>
					</Dialog.Trigger>
					<Dialog.Content class="sm:max-w-[425px]">
						<Dialog.Header>
							<Dialog.Title>Change user's plan</Dialog.Title>
							<Dialog.Description>Update users membership</Dialog.Description>
						</Dialog.Header>

						<MembershipForm data={data.form} {plans} />
					</Dialog.Content>
				</Dialog.Root>
			{:else}
				<Drawer.Root bind:open>
					<Drawer.Trigger asChild let:builder>
						<Button size="icon" class="w-6 h-6" builders={[builder]}>
							<Pencil class="w-4 h-4" />
						</Button>
					</Drawer.Trigger>
					<Drawer.Content class="p-4">
						<Dialog.Header>
							<Dialog.Title>Change user's plan</Dialog.Title>
							<Dialog.Description>Update users membership</Dialog.Description>
						</Dialog.Header>

						<Drawer.Footer class="pt-2">
							<Drawer.Close asChild let:builder>
								<Button variant="outline" builders={[builder]}>Cancel</Button>
							</Drawer.Close>
						</Drawer.Footer>
					</Drawer.Content>
				</Drawer.Root>
			{/if}
		{/await}
	</Card.Content>

	{#each data.member.memberships as membership}
		<Card.Content class="grid gap-6 ">
			<div class="flex items-center justify-between space-x-4 relative">
				<div class="flex items- space-x-4">
					<div>
						<Button
							variant="link"
							class="text-sm text-muted-foreground p-0 m-0"
							href={`/org/${$page.params.id}/plans`}>{membership.plan.name}</Button
						>
					</div>
				</div>

				<div class="ml-auto absolute right-0 text-sm self-center flex flex-col items-end">
					<div>
						{membership.createdAt.toLocaleString('en-US', {
							month: 'short',
							day: 'numeric',
							year: 'numeric',
							hour: 'numeric',
							minute: 'numeric'
						})}
					</div>
				</div>
			</div>
			{#if membership.provider !== 'None'}
				<div class="flex items-center justify-between space-x-4 relative">
					<div class="flex items-center space-x-4">
						<div class="text-sm text-muted-foreground flex gap-1 items-center">
							<img
								src={`/payment_providers/${membership.provider.toLowerCase()}.svg`}
								alt=""
								class="w-6 h-6"
							/>
							<span>{membership.provider}</span>
						</div>
					</div>
				</div>
			{/if}
		</Card.Content>
	{/each}
</Card.Root>

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
