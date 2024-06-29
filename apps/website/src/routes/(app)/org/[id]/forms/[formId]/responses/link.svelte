<script lang="ts">
	import { page } from '$app/stores';
	import { trpc } from '$lib/client/trpc';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	export let id: string;
	export let value: string;
	const utils = trpc().createUtils();
</script>

<a
	class={cn(buttonVariants({ variant: 'link' }), 'text-foreground p-0 m-0')}
	on:mouseenter={() =>
		utils.memberRouter.getMember.prefetch({
			orgId: $page.params.id,
			memberId: id
		})}
	href={`/org/${$page.params.id}/members/${id}`}>{value}</a
>
