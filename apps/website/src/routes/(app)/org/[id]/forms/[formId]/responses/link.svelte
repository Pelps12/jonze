<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	export let id: string;
	export let value: string;
</script>

<Button
	variant="link"
	class="text-foreground p-0 m-0"
	href={`/org/${$page.params.id}/members/${id}`}>{value}</Button
>
