<script lang="ts">
	import { page } from '$app/stores';

	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
</script>

<div class="flex flex-col items-center justify-center h-screen gap-6">
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="h-12 w-12 text-red-500"
	>
		<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
		<path d="M12 9v4" />
		<path d="M12 17h.01" />
	</svg>
	<div class="space-y-2 text-center">
		<p class="text-gray-500 dark:text-gray-400">
			{$page.error?.message ??
				" We're sorry, but an unexpected error has occurred. Please try refreshing the page."}
		</p>
	</div>
</div>
