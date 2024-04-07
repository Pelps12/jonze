<script lang="ts">
	import DataTable from './data-table.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import * as Alert from '$lib/components/ui/alert';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Copy, QrCode } from 'lucide-svelte';
	import { PUBLIC_URL } from '$env/static/public';
	import { toast } from 'svelte-sonner';
	import { browser } from '$app/environment';
	import QRCode from 'qrcode';

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
</script>

<div class="flex justify-end">
	<DropdownMenu.Root>
		<DropdownMenu.Trigger asChild let:builder>
			<Button variant="outline" builders={[builder]}>Signup Form</Button>
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
<div class=" mx-auto py-10">
	<DataTable members={data.members} organizationForm={data.organizationForm} />
</div>
