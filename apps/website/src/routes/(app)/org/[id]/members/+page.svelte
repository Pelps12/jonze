<script lang="ts">
	import DataTable from './data-table.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import * as Alert from '$lib/components/ui/alert';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Copy, PlusCircle, QrCode } from 'lucide-svelte';
	import { PUBLIC_URL } from '$env/static/public';
	import { toast } from 'svelte-sonner';
	import { browser } from '$app/environment';
	import QRCode from 'qrcode';
	import { Input } from '$lib/components/ui/input';
	import { writable } from 'svelte/store';
	import { goto, invalidate } from '$app/navigation';
	import { organizationForm } from '@repo/db/schema/organizationForm';

	export let data;

	console.log(data);

	const handleCopyLink = (link: string) => {
		if (browser) {
			navigator.clipboard.writeText(link).then(() => {
				toast.success('SIgnup Link added to Clipboard');
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

	let emailFilter = writable($page.url.searchParams.get('email'));

	emailFilter.subscribe((email) => console.log(email));

	const handleFilterSubmit = async () => {
		if ($emailFilter) {
			const url = new URL($page.url);
			url.searchParams.set('email', $emailFilter);
			window.location.href = url.toString();

			//$page.url.searchParams.set('email', $emailFilter);
		} else {
			const url = new URL($page.url);
			url.searchParams.delete('email');
			window.location.href = url.toString();
		}
	};

	let showStatusBar = true;
	let showActivityBar = false;
	let showPanel = false;
</script>

{#if !data.organizationForm}
	<Alert.Root class="mb-2">
		<Alert.Title>Quick Tip!</Alert.Title>
		<Alert.Description
			>You can add <a
				class="underline pointer-events-auto"
				href={`/org/${$page.params.id}/forms/create?form_name=User Info`}>custom user info</a
			> if your org requires additional fields from members on sign up</Alert.Description
		>
	</Alert.Root>
{/if}

<div class="flex justify-end">
	<DropdownMenu.Root>
		<DropdownMenu.Trigger asChild let:builder>
			<Button variant="outline" class="border-dotted" builders={[builder]}>Signup Form</Button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content>
			<DropdownMenu.Item
				on:click={() => handleCopyLink(`${PUBLIC_URL}/user/signup/${$page.params.id}`)}
				class="justify-between"
			>
				<span>Signup Link</span>
				<Copy class="ml-2 h-4 w-4" />
			</DropdownMenu.Item>

			<DropdownMenu.Item
				class="justify-between"
				on:click={() =>
					createQRCode(`Sign up - QR Code`, `${PUBLIC_URL}/user/signup/${$page.params.id}`)}
			>
				<span>SignUp QRCode</span>
				<QrCode class="ml-2 h-4 w-4" />
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>

<form class="my-3 flex gap-2 flex-start">
	<Input bind:value={$emailFilter} placeholder="Filter by Email" class="max-w-md" />
	<DropdownMenu.Root>
		<DropdownMenu.Trigger asChild let:builder>
			<Button variant="outline" builders={[builder]}><PlusCircle class="h-4 w-4 mr-2" />Plan</Button
			>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content class="w-56">
			<DropdownMenu.Label>Membership Plan</DropdownMenu.Label>
			<DropdownMenu.Separator />
			<DropdownMenu.CheckboxItem bind:checked={showStatusBar}
				>Default Plan</DropdownMenu.CheckboxItem
			>
			<DropdownMenu.CheckboxItem bind:checked={showActivityBar}>
				Paid Plan
			</DropdownMenu.CheckboxItem>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
	<Button on:click={() => handleFilterSubmit()}>Apply</Button>
</form>
<div class=" mx-auto py-10">
	<DataTable members={data.members} organizationForm={data.organizationForm} />
</div>
