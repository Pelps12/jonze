<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';

	type $$Props = HTMLAttributes<HTMLSpanElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<span
	aria-hidden
	class={cn('flex h-9 w-9 items-center justify-center', className)}
	{...$$restProps}
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="lucide lucide-ellipsis"
		><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle
			cx="5"
			cy="12"
			r="1"
		/></svg
	>
	<span class="sr-only">More pages</span>
</span>
