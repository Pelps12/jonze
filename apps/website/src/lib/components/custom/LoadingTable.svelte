<script lang="ts">
	import * as Table from '../ui/table';
	const emptyArray: number[] = new Array(10);
</script>

<div class="rounded-md border my-4">
	<Table.Root class="rounded-md">
		<Table.Body class="">
			{#each emptyArray as element}
				<Table.Row class="p-2 hover:bg-background">
					<div class="h-10 m-2 animate-pulse bg-muted rounded-sm"></div>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
