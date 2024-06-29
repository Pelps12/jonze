<script lang="ts">
	import { browser } from '$app/environment';

	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Input } from '$lib/components/ui/input';
	import { CopyIcon } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	export let open: boolean;
	export let key: string;

	const handleCopyKey = (key: string) => {
		if (browser) {
			navigator.clipboard.writeText(key).then(() => {
				toast.success('API Key Copied to Clipboard');
			});
		}
	};
</script>

<AlertDialog.Root bind:open closeOnOutsideClick={false}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>API Key</AlertDialog.Title>
			<AlertDialog.Description>
				One you close this dialog, the API key will no longer be visible.
			</AlertDialog.Description>
			<div class="flex w-full max-w-sm items-center space-x-2">
				<Input id="name" value={key} class="col-span-3" readonly />
				<AlertDialog.Action class="w-auto" on:click={() => handleCopyKey(key)}>
					<CopyIcon class="h-4 w-4 p-0" />
				</AlertDialog.Action>
			</div>
		</AlertDialog.Header>
	</AlertDialog.Content>
</AlertDialog.Root>
