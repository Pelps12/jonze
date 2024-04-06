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
			{data.content.attributes.title}
		</div>

		<p>By <span class="font-semibold">{data.content.attributes.author}</span></p>

		<p>
			{new Date(data.content.attributes.date).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			})}
		</p>
	</div>
	{@html data.content.code}
{/if}
