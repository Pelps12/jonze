<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { ChevronDown, CopyIcon, Pencil, PlusCircle, PlusIcon, TrashIcon } from 'lucide-svelte';
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
	import { cn, formatName, getInitials } from '$lib/utils';
	import { Badge, badgeVariants } from '$lib/components/ui/badge';
	import MemberUpdateForm from './MemberUpdateForm.svelte';
	import { trpc } from '$lib/client/trpc';
	import DataTable from './data-table.svelte';

	const memberQuery = trpc().memberRouter.getMember.createQuery({
		orgId: $page.params.id,
		memberId: $page.params.memId
	});
	$: data = $memberQuery.data;

	let open = false;

	let updateModalOpen = false;

	const isDesktop = mediaQuery('(min-width: 768px)');
</script>

{#if data}
	<Card.Root class="max-w-md">
		<Card.Header>
			<Card.Title
				><div class="flex gap-2 flex-wrap items-center">
					<p>
						{data.member.role.charAt(0).toUpperCase() + data.member.role.slice(1).toLowerCase()}
					</p>

					{#if data.member.tags}
						{#each data.member.tags.names as tagName}
							<Badge variant="outline">{tagName}</Badge>
						{/each}
					{/if}

					{#if $isDesktop}
						<Dialog.Root bind:open={updateModalOpen}>
							<Dialog.Trigger asChild let:builder>
								<Button
									size="sm"
									class={cn(badgeVariants({ variant: 'outline' }), 'h-6 border-dotted border-2')}
									builders={[builder]}
									variant="outline"
								>
									<PlusIcon class="h-2 w-2 mr-2" /> Add Tags
								</Button>
							</Dialog.Trigger>
							<Dialog.Content class="sm:max-w-[425px]">
								<Dialog.Header>
									<Dialog.Title>Change user's plan</Dialog.Title>
									<Dialog.Description>Update users membership</Dialog.Description>
								</Dialog.Header>

								<MemberUpdateForm
									data={data.memberForm}
									closeForm={() => (updateModalOpen = false)}
								/>
							</Dialog.Content>
						</Dialog.Root>
					{:else}
						<Drawer.Root bind:open={updateModalOpen}>
							<Drawer.Trigger asChild let:builder>
								<Button
									size="sm"
									class={cn(badgeVariants({ variant: 'outline' }), 'h-6 border-dotted border-2')}
									builders={[builder]}
									variant="outline"
								>
									<PlusIcon class="h-2 w-2 mr-2" /> Add Tags
								</Button>
							</Drawer.Trigger>
							<Drawer.Content class="p-4">
								<Dialog.Header>
									<Dialog.Title>Change user's plan</Dialog.Title>
									<Dialog.Description>Update users membership</Dialog.Description>
								</Dialog.Header>

								<MemberUpdateForm
									data={data.memberForm}
									closeForm={() => (updateModalOpen = false)}
								/>

								<Drawer.Footer class="pt-2">
									<Drawer.Close asChild let:builder>
										<Button variant="outline" builders={[builder]}>Cancel</Button>
									</Drawer.Close>
								</Drawer.Footer>
							</Drawer.Content>
						</Drawer.Root>
					{/if}
				</div></Card.Title
			>
		</Card.Header>
		<Card.Content class="grid gap-6 ">
			<div class="flex items-center justify-between space-x-4 relative">
				<div class="flex items-center space-x-4">
					<Avatar.Root>
						<Avatar.Image
							src={data.member.user.profilePictureUrl}
							alt={data.member.user.firstName}
						/>
						<Avatar.Fallback
							>{getInitials(
								formatName(data.member.user.firstName, data.member.user.lastName)
							)}</Avatar.Fallback
						>
					</Avatar.Root>
					<div>
						<p class="text-sm font-medium leading-none">
							{formatName(data.member.user.firstName, data.member.user.lastName)}
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

							<MembershipForm data={data.form} {plans} closeForm={() => (open = false)} />
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
							<MembershipForm data={data.form} {plans} closeForm={() => (open = false)} />

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
								href={`/org/${$page.params.id}/plans?id=${membership.plan.id}`}
								>{membership.plan.name}</Button
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

	<DataTable member={data.member} />
{/if}
