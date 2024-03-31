<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { onMount } from 'svelte';
	import { edit, deleteElement, form } from '$lib/stores/forms';
	import FieldWrapper from './FieldWrapper.svelte';
	import type { CustomTextAreaField } from '$lib/types/forms';
	import { Textarea } from '$lib/components/ui/textarea';
	export let id: number;
	export let data: CustomTextAreaField;
	$: temporaryEdit = structuredClone(data);
	const handleChange = (value: Partial<CustomTextAreaField>) => {
		temporaryEdit = { ...temporaryEdit, ...value };
	};
	onMount(() => {
		console.log(temporaryEdit, id);
	});

	const handleSave = () => {
		console.log('HIGH');
		edit(id, temporaryEdit);
	};

	const handleDelete = () => {
		deleteElement(id);
	};
</script>

<FieldWrapper {handleDelete} {handleSave}>
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
			<Textarea
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
