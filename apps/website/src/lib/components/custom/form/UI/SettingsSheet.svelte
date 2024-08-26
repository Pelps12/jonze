<script lang="ts">
	import Alert from '$lib/components/ui/alert/alert.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import * as Select from '$lib/components/ui/select';
	import { edit } from '$lib/stores/forms';
	import type { ArrayElement } from '$lib/types/misc';
	import type { CustomField, CustomForm } from '@repo/form-validation';
	import { Checkbox } from 'bits-ui';
	import { onMount } from 'svelte';

	export let element: CustomField;

	const validator = element.validator;

	const formats: Record<string, string> = {
		phone: 'Phone Number',
		email: 'Email',
		url: 'URL',
		none: 'None'
	};

	$: temporaryEdit = structuredClone(element);

	onMount(() => {
		console.log(temporaryEdit, element.id);
	});

	const handleSave = () => {
		console.log('HIGH');
		edit(element.id, temporaryEdit);
	};

	const handleChange = (value: Partial<CustomField>) => {
		console.log('HEEEYYYY');
		//@ts-ignore
		temporaryEdit = { ...temporaryEdit, ...value };
	};

	$: console.log(temporaryEdit);
</script>

<div class="mt-5 flex flex-col gap-5">
	{#if temporaryEdit.type === 'text' || temporaryEdit.type === 'textarea'}
		{#if temporaryEdit.validator?.required}
			<div class="flex items-center space-x-2">
				<Label
					id="terms-label"
					for="terms"
					class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>Required
				</Label>
				<Checkbox.Root>
					<Checkbox.Indicator />
					<Checkbox.Input />
				</Checkbox.Root>
			</div>
		{/if}

		{#if temporaryEdit.type === 'text' && temporaryEdit.validator?.minLength}
			<div class="flex w-full max-w-sm flex-col gap-1.5">
				<Label for="minLength">Min Length</Label>
				<Input
					type="number"
					class="w-auto"
					id="email"
					value={temporaryEdit.validator?.minLength}
					on:input={(e) =>
						temporaryEdit.validator &&
						handleChange({
							validator: { ...temporaryEdit.validator, minLength: parseInt(e.target?.value) }
						})}
				/>
			</div>
		{/if}

		{#if temporaryEdit.validator?.maxLength}
			<div class="flex w-full max-w-sm flex-col gap-1.5">
				<Label for="maxLength">Max Length</Label>
				<Input
					type="number"
					class="w-auto"
					id="email"
					value={temporaryEdit.validator.maxLength}
					on:input={(e) =>
						temporaryEdit.validator &&
						handleChange({
							validator: { ...temporaryEdit.validator, maxLength: parseInt(e.target?.value) }
						})}
				/>
			</div>
		{/if}

		{#if temporaryEdit.type === 'text'}
			<div class="flex w-full max-w-sm flex-col gap-1.5">
				<Label for="maxLength">Format</Label>
				<Select.Root
					items={Object.entries(formats).map(([value, label]) => ({
						label,
						value
					}))}
					portal={null}
					selected={temporaryEdit.validator?.format
						? {
								label: formats[temporaryEdit.validator.format],
								value: temporaryEdit.validator.format
							}
						: undefined}
					onSelectedChange={(v) =>
						v &&
						temporaryEdit.validator &&
						handleChange({
							validator: { ...temporaryEdit.validator, format: v.value }
						})}
				>
					<Select.Trigger class="w-full">
						<Select.Value placeholder="Select a format" />
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							{#each Object.keys(formats) as format}
								<Select.Item value={format} label={formats[format]}>{formats[format]}</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
					<Select.Input name="format" />
				</Select.Root>
			</div>
		{/if}
	{/if}

	<Button on:click={() => handleSave()}>Save Changes</Button>
</div>
