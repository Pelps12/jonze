<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import * as Select from '$lib/components/ui/select';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { CustomForm } from '@repo/form-validation';
	export let form: CustomForm;
	export let userResponse: Record<string, string> | undefined;
	$: userResponse, console.log(userResponse);
	$: response, console.log(response);

	$: response = form.reduce<Record<string, string>>((accumulator, currentKey) => {
		if (userResponse) {
			console.log(currentKey, userResponse);
			accumulator[currentKey.label] = userResponse[currentKey.label]; // Set each key's value to an empty string
		}
		return accumulator;
	}, {});
</script>

<div class="grid w-full items-center gap-4">
	{#each form as element}
		<div class="flex flex-col space-y-1.5 relative">
			{#if element.type === 'text'}
				<Label for={element.label}>{element.label}</Label>
				<Input
					id={element.label}
					placeholder={response[element.label] ? response[element.label] : element.placeholder}
					name={element.label}
					required
				/>
			{:else if element.type === 'textarea'}
				<Label for={element.label}>{element.label}</Label>
				<Textarea
					id={element.label}
					placeholder={response[element.label] ? response[element.label] : element.placeholder}
					name={element.label}
					required
				/>
			{:else if element.type === 'radio'}
				<Label for="framework">{element.label}</Label>
				<RadioGroup.Root required={true}>
					{#each element.options as option}
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value={option.label} id={option.label} />
							<Label for={option.label}>{option.label}</Label>
						</div>
					{/each}
				</RadioGroup.Root>
			{:else if element.type === 'dropdown'}
				<Label for="framework">{element.label}</Label>
				{#if !!userResponse}
					<Input
						id={element.label}
						placeholder={response[element.label] ? response[element.label] : 'Select'}
						name={element.label}
						required
					/>
				{:else}
					<select
						on:change={(e) => {
							if (typeof e?.currentTarget.value === 'string')
								response = { ...response, [element.label]: e.currentTarget.value };
						}}
						name={element.label}
						required
						class="!flex !h-auto !w-full !items-center !justify-between !rounded-md !border !border-input !bg-background !px-3 !py-2 !text-sm !ring-offset-background placeholder:!text-muted-foreground focus:!outline-none focus:!ring-2 focus:!ring-ring focus:!ring-offset-2 disabled:!cursor-not-allowed disabled:!opacity-50 [&>span]:!line-clamp-1'"
					>
						<option selected disabled hidden value="">Select</option>
						{#each element.options as option}
							<option class="py-2" value={option.label} label={option.label}>{option.label}</option>
						{/each}
					</select>
					<!-- <Select.Root
						onSelectedChange={(e) => {
							if (typeof e?.value === 'string')
								response = { ...response, [element.label]: e.value };
						}}
					>
						<Select.Trigger id={element.label}>
							<Select.Value placeholder="Select" />
						</Select.Trigger>
						<Select.Content>
							{#each element.options as option}
								<Select.Item value={option.label} label={option.label}>{option.label}</Select.Item>
							{/each}
						</Select.Content>
						{#if response[element.label]}
							<input
								class="invisible"
								name={element.label}
								value={response[element.label]}
								required
							/>
						{:else}
							<input class="invisible" name={element.label} required />
						{/if}
					</Select.Root> -->
				{/if}
			{/if}
		</div>
	{/each}
</div>
