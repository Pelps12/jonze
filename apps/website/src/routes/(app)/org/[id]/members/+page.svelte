<script lang="ts">
	import DataTable from './data-table.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import * as Alert from '$lib/components/ui/alert';
	export let data;

	console.log(data);
</script>

<div class=" mx-auto py-10">
	<DataTable members={data.members} organizationForm={data.organizationForm} />
</div>
