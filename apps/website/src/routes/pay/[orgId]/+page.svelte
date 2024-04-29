<script>
	import { page } from '$app/stores';
	export let data;
	import * as Card from '$lib/components/ui/card';
</script>

<div class="text-7xl max-w-3xl mx-auto p-8">
	<div>
		{#if data.org.logo}
			<img src={data.org.logo} alt="Organization" width="100" height="100" class="mx-auto" />
		{/if}

		<p class="text-center font-bold text-xl">{data.org.name}</p>
	</div>

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
