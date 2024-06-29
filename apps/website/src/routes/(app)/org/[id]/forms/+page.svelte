<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { mediaQuery } from 'svelte-legos';
	import { page } from '$app/stores';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Copy, MoreHorizontal, QrCode } from 'lucide-svelte';
	import { browser } from '$app/environment';
	import { PUBLIC_URL } from '$env/static/public';
	import * as QRCode from 'qrcode';
	import { toast } from 'svelte-sonner';
	import { trpc } from '$lib/client/trpc';

	const formQuery = trpc().formRouter.getForms.createQuery({
		orgId: $page.params.id
	});

	const handleCopyAttendance = (formId: string) => {
		if (browser) {
			navigator.clipboard.writeText(`${PUBLIC_URL}/form/${formId}`).then(() => {
				toast.success('Form Link added to Clipboard');
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

<div class="flex justify-between items-center mb-6">
	<h2 class="text-xl font-semibold">Forms</h2>
	<div class="flex space-x-2">
		<Button variant="outline" href={`forms/create`}>Add Form</Button>
	</div>
</div>

{#if $formQuery.data}
	<div class="p-6 grid md:grid-cols-2 2xl:grid-cols-3 gap-4">
		{#each $formQuery.data.forms as form}
			<Card.Root class="w-[350px]">
				<Card.Header>
					<Card.Title class="flex justify-between"
						>{form.name}
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
									on:click={() => handleCopyAttendance(form.id)}
									class="justify-between"
								>
									<span>Form Link</span>
									<Copy class="ml-2 h-4 w-4" />
								</DropdownMenu.Item>

								<DropdownMenu.Item
									class="justify-between"
									on:click={() =>
										createQRCode(`${form.name} - QR Code`, `${PUBLIC_URL}/form/${form.id}`)}
								>
									<span>Form QRCode</span>
									<QrCode class="ml-2 h-4 w-4" />
								</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</Card.Title>
					<Card.Description>
						Last edited {form.updatedAt.toLocaleString('en-US', {
							month: 'short', // abbreviated month name
							day: 'numeric', // numeric day
							hour: 'numeric', // numeric hour
							minute: '2-digit', // 2-digit minute
							hour12: true // 12-hour time format
						})}
					</Card.Description>
				</Card.Header>

				<Card.Footer class="flex justify-between">
					{#if form.responses.length == 0}
						<Button variant="outline" href={`/org/${$page.params.id}/forms/${form.id}`}>Edit</Button
						>
					{:else}
						<Button variant="outline" href={`/org/${$page.params.id}/forms/${form.id}/responses`}
							>Responses</Button
						>
					{/if}
				</Card.Footer>
			</Card.Root>
		{/each}
	</div>
{/if}
