<script lang="ts">
	import type { PageData } from './$types';

	import Form from '$lib/components/custom/form/UI/Form.svelte';

	export let data: PageData;
</script>

<Form dataForm={data.modifiedForm} schema={data.form} />
