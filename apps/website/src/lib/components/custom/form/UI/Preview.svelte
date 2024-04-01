<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { CustomForm } from '$lib/types/forms';
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
		<div class="flex flex-col space-y-1.5">
			{#if element.type === 'text'}
				<Label for={element.label}>{element.label}</Label>
				<Input
					id={element.label}
					placeholder={response[element.label] ? response[element.label] : element.placeholder}
					name={element.label}
				/>
			{:else if element.type === 'textarea'}
				<Label for={element.label}>{element.label}</Label>
				<Textarea
					id={element.label}
					placeholder={response[element.label] ? response[element.label] : element.placeholder}
					name={element.label}
				/>
			{:else if element.type === 'dropdown'}
				<Label for="framework">{element.label}</Label>
				{#if !!userResponse}
					<Input
						id={element.label}
						placeholder={response[element.label] ? response[element.label] : 'Select'}
						name={element.label}
					/>
				{:else}
					<Select.Root
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
						<input class="hidden" name={element.label} value={response[element.label]} />
					</Select.Root>
				{/if}
			{/if}
		</div>
	{/each}
</div>
