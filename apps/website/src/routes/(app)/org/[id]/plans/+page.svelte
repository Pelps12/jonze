<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Drawer from '$lib/components/ui/drawer';
	import * as Dialog from '$lib/components/ui/dialog';
	import { mediaQuery } from 'svelte-legos';
	import { writable } from 'svelte/store';
	import PlanForm from './PlanForm.svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { toast } from 'svelte-sonner';
	import { PUBLIC_URL } from '$env/static/public';
	import QRCode from 'qrcode';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Copy, MoreHorizontal, QrCode } from 'lucide-svelte';
	import * as Alert from '$lib/components/ui/alert';
	let newFormOpen = writable($page.url.searchParams.has('newplan'));

	export let data;

	const isDesktop = mediaQuery('(min-width: 768px)');

	const handleCopyAttendance = (planId: string) => {
		if (browser) {
			navigator.clipboard
				.writeText(`${PUBLIC_URL}/pay/${$page.params.id}/plan/${planId}`)
				.then(() => {
					toast.success('Payment Link added to Clipboard');
				});
		}
	};

	const createQRCode = async (fileName: string, link: string) => {
		if (browser) {
			const aElement = document.createElement('a');
			aElement.setAttribute('download', fileName);
			const href = await QRCode.toDataURL(link, {
				width: 800
			});
			aElement.href = href;
			aElement.setAttribute('target', '_blank');
			aElement.click();
			URL.revokeObjectURL(href);
		}
	};
</script>

<Alert.Root class="mb-2">
	<Alert.Title>Quick One!</Alert.Title>
	<Alert.Description
		>Managed memberships are now available. Ask to have them enabled.</Alert.Description
	>
</Alert.Root>

<div class="flex justify-between items-center mb-6">
	<h2 class="text-xl font-semibold">Membership Plans</h2>

	<div class="flex space-x-2">
		{#if $isDesktop}
			<Dialog.Root bind:open={$newFormOpen}>
				<Dialog.Trigger asChild let:builder>
					<Button variant="outline" builders={[builder]}>Add Plan</Button>
				</Dialog.Trigger>
				<Dialog.Content class="sm:max-w-[425px]">
					<Dialog.Header>
						<Dialog.Title>Create your Plan</Dialog.Title>
						<Dialog.Description>Enables tiers for memberships</Dialog.Description>
					</Dialog.Header>
					<PlanForm data={data.form} />
				</Dialog.Content>
			</Dialog.Root>
		{:else}
			<Drawer.Root bind:open={$newFormOpen}>
				<Drawer.Trigger asChild let:builder>
					<Button variant="outline" builders={[builder]}>Add Plan</Button>
				</Drawer.Trigger>
				<Drawer.Content class="p-4">
					<Drawer.Header class="text-left">
						<Drawer.Title>Create your Plan</Drawer.Title>
						<Drawer.Description>Enables tiers for memberships</Drawer.Description>
					</Drawer.Header>
					<PlanForm data={data.form} />
					<Drawer.Footer class="pt-2">
						<Drawer.Close asChild let:builder>
							<Button variant="outline" builders={[builder]}>Cancel</Button>
						</Drawer.Close>
					</Drawer.Footer>
				</Drawer.Content>
			</Drawer.Root>
		{/if}
	</div>
</div>

<div class=" rounded-lg p-6">
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each data.plans as plan}
			<Card.Root class="max-w-xs">
				<Card.Header>
					<Card.Title class="flex justify-between">
						<p>{plan.name}</p>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger asChild let:builder>
								<Button
									variant="ghost"
									builders={[builder]}
									class="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
								>
									<MoreHorizontal class="h-4 w-4" />
									<span class="sr-only">Open menu</span>
								</Button>
							</DropdownMenu.Trigger>

							<DropdownMenu.Content class="w-[200px]" align="end">
								<DropdownMenu.Item
									on:click={() => handleCopyAttendance(plan.id)}
									class="justify-between"
								>
									<span>Plan Link</span>
									<Copy class="ml-2 h-4 w-4" />
								</DropdownMenu.Item>

								<DropdownMenu.Item
									class="justify-between"
									on:click={() =>
										createQRCode(
											`${plan.name} - QR Code`,
											`${PUBLIC_URL}/pay/${$page.params.id}/plan/${plan.id}`
										)}
								>
									<span>Plan QRCode</span>
									<QrCode class="ml-2 h-4 w-4" />
								</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</Card.Title>
					{#if plan.start}
						<Card.Description
							>Expires: {new Date(plan.start).toLocaleDateString('en-US', {
								month: 'long',
								day: 'numeric'
							})}
						</Card.Description>
					{/if}
				</Card.Header>

				<Card.Content>
					<h1 class="text-xl font-semibold">
						${plan.amount}
					</h1>
					<p class="text-sm">
						{plan.interval.years} year(s)
					</p>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
</div>
