<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { ArrayElement } from '$lib/types/misc';
	import { PlusCircleIcon, Trash } from 'lucide-svelte';
	import { edit, deleteElement, form } from '$lib/stores/forms';
	import FieldWrapper from './FieldWrapper.svelte';
	import type { CustomRadioGroupField } from '@repo/form-validation';
	export let data: CustomRadioGroupField;
	export let id: number;
	$: temporaryEdit = structuredClone(data);

	const handleSave = () => {
		edit(id, temporaryEdit);
	};

	const handleChange = (value: Partial<CustomRadioGroupField>) => {
		temporaryEdit = { ...temporaryEdit, ...value };
		handleSave();
	};

	const handleDelete = () => {
		deleteElement(id);
	};

	const handleItemDelete = (id: number) => {
		temporaryEdit = {
			...temporaryEdit,
			...{
				options: temporaryEdit.options.filter((_, index) => id !== index)
			}
		};
		handleSave();
	};

	const handleChangeOption = (
		id: number,
		value: Partial<ArrayElement<CustomRadioGroupField['options']>>
	) => {
		temporaryEdit = {
			...temporaryEdit,
			...{
				options: temporaryEdit.options.map((option, index) =>
					index === id ? { ...option, ...value } : option
				)
			}
		};
		handleSave();
	};
	const handleAddMore = () => {
		const numOptions = temporaryEdit.options.length;
		temporaryEdit = {
			...temporaryEdit,
			...{
				options: [
					...temporaryEdit.options,
					{
						label: `Item ${numOptions + 1}`
					}
				]
			}
		};
		handleSave();
	};
</script>

<FieldWrapper {handleDelete} {handleSave}>
	<div class="flex flex-col gap-2 relative">
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
			{#each temporaryEdit.options as option, index}
				<div class="flex justify-between items-center gap-2">
					<Input
						id={index.toString()}
						value={option.label}
						on:input={(e) =>
							handleChangeOption(index, {
								label: e.target?.value
							})}
					/>
					<Button
						variant="destructive"
						size="icon"
						class="h-7 w-7"
						on:click={() => handleItemDelete(index)}
					>
						<Trash class="h-4 w-4" />
					</Button>
				</div>
			{/each}
		</div>

		<Button variant="secondary" on:click={() => handleAddMore()}>
			<PlusCircleIcon class="h-4 w-4" />
		</Button>
	</div>
</FieldWrapper>
