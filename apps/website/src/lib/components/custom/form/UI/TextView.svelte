<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { onMount } from 'svelte';
	import { edit, deleteElement, form } from '$lib/stores/forms';
	import FieldWrapper from './FieldWrapper.svelte';
	import type { CustomTextField } from '@repo/form-validation';
	export let id: number;
	export let data: CustomTextField;
	$: temporaryEdit = structuredClone(data);

	onMount(() => {
		console.log(temporaryEdit, id);
	});

	const handleSave = () => {
		console.log('HIGH');
		edit(id, temporaryEdit);
	};

	const handleChange = (value: Partial<CustomTextField>) => {
		temporaryEdit = { ...temporaryEdit, ...value };
		handleSave();
	};

	const handleDelete = () => {
		deleteElement(id);
	};

	export let handleOpenSettings = (id: number) => {
		console.log('UNIMPLEMENTED');
	};
</script>

<FieldWrapper {handleDelete} {handleSave} {handleOpenSettings} {id}>
	<div class="flex flex-col gap-2">
		<div class="flex flex-col space-y-1.5">
			<Input
				id="name"
				placeholder="Label"
				value={temporaryEdit.label}
				on:input={(e) =>
					handleChange({
						label: e.target?.value
					})}
			/>
		</div>

		<div class="flex flex-col space-y-1.5">
			<Input
				id="name"
				placeholder="Placeholder"
				value={temporaryEdit.placeholder}
				on:input={(e) =>
					handleChange({
						placeholder: e.target?.value
					})}
			/>
		</div>
	</div>
</FieldWrapper>
