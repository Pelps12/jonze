<script lang="ts">
	import { badgeVariants } from '$lib/components/ui/badge';
	import MultiSelect from 'svelte-multiselect';

	const ui_libs = [`#social`, `#gbm`, `#study-session`];

	let selected: string[] = [];
</script>

Favorite Frontend Tools?

<code>selected = {JSON.stringify(selected)}</code>

<div class="w-[300px]">
	<MultiSelect
		bind:selected
		options={ui_libs}
		allowUserOptions={true}
		outerDivClass={'flex h-auto w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1'}
		liSelectedClass={badgeVariants({ variant: 'outline' })}
		liOptionClass="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
		ulOptionsClass={' z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md outline-none'}
		allowEmpty={true}
	/>
</div>
