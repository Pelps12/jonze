<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { createDynamicSchema, type CustomForm } from '@repo/form-validation';

	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Select from '$lib/components/ui/select';
	import { onMount } from 'svelte';
	import SelectItem from '$lib/components/ui/select/select-item.svelte';
	import { derived, get } from 'svelte/store';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import type { OrgForm } from '@repo/db';
	import { LoaderCircle } from 'lucide-svelte';

	export let action = '';

	export let dataForm: CustomForm;
	export let schema: SuperValidated<
		{
			[x: string]: any;
		},
		any,
		{
			[x: string]: any;
		}
	>;

	export let actionName = 'Submit';

	const data = { form: dataForm, schema };

	const form = superForm(data.schema, {
		validators: zodClient(createDynamicSchema(data.form))
	});

	const { form: formData, enhance } = form;

	const selectedFieldsStore = derived(formData, ($formData) =>
		data.form.reduce<
			Record<
				string,
				{
					label: string;
					value: string;
				}
			>
		>((acc, val) => {
			if (val.type === 'dropdown') {
				console.log($formData);
				if ($formData[val.id.toString()]) {
					console.log($formData[val.id.toString()]);
					acc[val.id.toString()] = {
						label: $formData[val.id.toString()],
						value: $formData[val.id.toString()]
					};
				}
			}
			return acc;
		}, {})
	);
</script>

<form method="POST" use:enhance class="" {action}>
	{#each data.form as element}
		{#if element.type === 'text'}
			<Form.Field {form} name={element.id.toString()}>
				<Form.Control let:attrs>
					<Form.Label>{element.label}</Form.Label>
					<Input
						{...attrs}
						bind:value={$formData[element.id.toString()]}
						placeholder={element.placeholder}
					/>
				</Form.Control>

				<Form.FieldErrors />
			</Form.Field>
		{:else if element.type === 'textarea'}
			<Form.Field {form} name={element.id.toString()}>
				<Form.Control let:attrs>
					<Form.Label>{element.label}</Form.Label>
					<Textarea
						{...attrs}
						placeholder={element.placeholder}
						class="resize-none"
						bind:value={$formData[element.id.toString()]}
					/>
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		{:else if element.type === 'radio'}
			<Form.Fieldset {form} name={element.id.toString()} class="space-y-3">
				<Form.Legend>{element.label}</Form.Legend>
				<RadioGroup.Root
					bind:value={$formData[element.id.toString()]}
					class="flex flex-col space-y-1"
				>
					{#each element.options as option}
						<div class="flex items-center space-x-3 space-y-0">
							<Form.Control let:attrs>
								<RadioGroup.Item value={option.label} {...attrs} />
								<Form.Label class="font-normal">{option.label}</Form.Label>
							</Form.Control>
						</div>
					{/each}

					<RadioGroup.Input name={element.id.toString()} />
				</RadioGroup.Root>
				<Form.FieldErrors />
			</Form.Fieldset>
		{:else if element.type === 'dropdown'}
			<Form.Field {form} name={element.id.toString()}>
				<Form.Control let:attrs>
					<Form.Label>{element.label}</Form.Label>
					<Select.Root
						selected={$selectedFieldsStore[element.id.toString()]}
						onSelectedChange={(v) => {
							v && ($formData[element.id.toString()] = v.value);
						}}
					>
						<Select.Trigger {...attrs}>
							<Select.Value placeholder={'Select'} />
						</Select.Trigger>
						<Select.Content>
							<!-- svelte-ignore empty-block -->
							{#each element.options as option}
								<Select.Item value={option.label} label={option.label}>{option.label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					{#if $formData[element.id.toString()]}
						<input hidden bind:value={$formData[element.id.toString()]} name={attrs.name} />
					{/if}
				</Form.Control>

				<Form.FieldErrors />
			</Form.Field>
		{/if}
	{/each}
	<div class="flex justify-center p-5">
		<Form.Button class="" disabled={get(form.submitting)}>
			{#if get(form.submitting)}
				<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
			{/if}
			{actionName}</Form.Button
		>
	</div>
</form>
