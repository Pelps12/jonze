<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { MoreHorizontal } from 'lucide-svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';

	import { page } from '$app/stores';
	export let memId: string | null;
</script>

<Dialog.Root>
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
		<DropdownMenu.Content class="w-[160px]" align="end">
			<DropdownMenu.Item>
				<Dialog.Trigger>User Response</Dialog.Trigger>
			</DropdownMenu.Item>

			{#if memId}
				<DropdownMenu.Item href={`/org/${$page.params.id}/members/${memId}`}>
					User Details
				</DropdownMenu.Item>
			{/if}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</Dialog.Root>
