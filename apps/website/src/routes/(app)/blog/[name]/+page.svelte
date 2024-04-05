<script lang="ts">
	import { onMount } from 'svelte';

	export let data;
	onMount(async () => {
		console.log(data.content);
	});
</script>

{#if data.content?.code}
	<div>
		<div class="text-5xl text-center font-bold">
			{data.content.data?.fm?.title}
		</div>

		<p>By <span class="font-semibold">{data.content.data?.fm?.author}</span></p>

		<p>
			{new Date(data.content.data?.fm?.date).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			})}
		</p>
	</div>
	{@html data.content.code}
{/if}
