<script lang="ts">
	import DataTable from './data-table.svelte';

    export let data;
</script>

<h2 class="text-xl font-semibold">Event Details of "{data.event.name}"</h2>

<div class="container mx-auto py-10">
    <DataTable attendants={data.event.attendances} form={data.event.form}/>
  </div>