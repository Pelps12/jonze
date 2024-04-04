<script>
	import { page } from '$app/stores';
	export let data;
	import * as Card from '$lib/components/ui/card';
</script>

<div class="text-7xl max-w-3xl mx-auto">
	<h1 class="text-center text-lg font-bold">
		{data.org.name}
	</h1>

	{#each data.org.plans as plan}
		<a
			class="flex flex-col gap-2 p-4 pointer-events-auto"
			href={`./${$page.params.orgId}/plan/${plan.id}`}
		>
			<Card.Root>
				<Card.Header>
					<Card.Title>{plan.name}</Card.Title>
					{#if plan.amount}
						<Card.Description
							>Price: {new Intl.NumberFormat('en-US', {
								style: 'currency',
								currency: 'USD'
							}).format(parseFloat(plan.amount))}</Card.Description
						>
					{/if}
				</Card.Header>
			</Card.Root>
		</a>
	{/each}
</div>
