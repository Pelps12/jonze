<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { MoreHorizontal } from 'lucide-svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';

	import { page } from '$app/stores';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { trpc } from '$lib/client/trpc';
	export let memberId: string;
	let open = false;
	$: open, console.log(open);
	let confirmDeletionOpen = false;

	const memberDeletionMutation = trpc().memberRouter.deleteMember.createMutation();
	const utils = trpc().createUtils();
</script>

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
		<DropdownMenu.Item href={`/org/${$page.params.id}/members/${memberId}`}
			>Details</DropdownMenu.Item
		>
		<DropdownMenu.Item>Favorite</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<DropdownMenu.Separator />

		<DropdownMenu.Item
			class="text-destructive"
			on:click={async () =>
				$memberDeletionMutation
					.mutateAsync({
						orgId: $page.params.id,
						memberId
					})
					.then(() => utils.memberRouter.getMembers.invalidate())}>Delete</DropdownMenu.Item
		>
	</DropdownMenu.Content>
</DropdownMenu.Root>
