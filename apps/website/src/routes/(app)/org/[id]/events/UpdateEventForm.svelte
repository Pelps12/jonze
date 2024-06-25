<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { type EventUpdationSchema, eventUpdationSchema } from './schema';
	import SuperDebug, {
		type SuperValidated,
		type Infer,
		superForm,
		dateProxy
	} from 'sveltekit-superforms';
	import { Input } from '$lib/components/ui/input';
	import { client } from '$lib/client/uploadcare';
	import type { OrgForm, Event as dbEvent } from '@repo/db/types';
	import { onMount, tick } from 'svelte';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Popover from '$lib/components/ui/popover';
	import * as Command from '$lib/components/ui/command';
	import { buttonVariants } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { Check, ChevronsUpDown } from 'lucide-svelte';
	import type { Writable } from 'svelte/store';
	import { MultiSelect } from 'svelte-multiselect';
	import { badgeVariants } from '$lib/components/ui/badge';
	import { browser } from '$app/environment';

	export let data: SuperValidated<Infer<EventUpdationSchema>>;
	export let forms: { id: string; name: string }[] = [];
	export let event: (dbEvent & { form: OrgForm | null }) | undefined;
	export let actionType: 'create' | 'update' = 'create';
	export let closeForm: () => void;

	const form = superForm(data, {
		validators: zodClient(eventUpdationSchema),
		onResult: () => {
			closeForm();
		}
	});

	const default_tags = [`#social`, `#gbm`, `#study-session`];

	async function handleUpload(
		e: Event & { currentTarget: EventTarget & HTMLInputElement }
	): Promise<void> {
		if (!e.currentTarget.files) return;
		const file = e.currentTarget.files[0];
		client.uploadFile(file).then((file) => {
			console.log(file);
			$formData.image = file.cdnUrl;
		});
		console.log(form);
	}

	onMount(() => {
		console.log('MEN MOUNT');
	});

	const { form: formData, enhance, constraints } = form;

	let open = false;

	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}
	const startProxy = dateProxy(form, 'start', { format: 'datetime-local' });
	const endProxy = dateProxy(form, 'end', { format: 'datetime-local' });

	const handleTagSelect = () => {};
</script>

<form
	method="POST"
	use:enhance
	enctype="multipart/form-data"
	class="p-4"
	action={actionType === 'update' ? '?/update' : '?/create'}
>
	<Form.Field {form} name="id" class="hidden">
		<Form.Control let:attrs>
			<Form.Label>ID</Form.Label>
			<Input {...attrs} bind:value={$formData.id} placeholder="ID of the Event" />
		</Form.Control>
	</Form.Field>

	<Form.Field {form} name="name">
		<Form.Control let:attrs>
			<Form.Label>Name</Form.Label>
			<Input {...attrs} bind:value={$formData.name} placeholder="Name of the Event" />
		</Form.Control>
	</Form.Field>

	<Form.Field {form} name="description">
		<Form.Control let:attrs>
			<Form.Label>Description</Form.Label>
			<Textarea
				{...attrs}
				bind:value={$formData.description}
				placeholder="Tell your members a bit more about the event"
			/>
		</Form.Control>
	</Form.Field>

	<Form.Field {form} name="start">
		<Form.Control let:attrs>
			<Form.Label>Start Time</Form.Label>
			<Input
				{...attrs}
				type="datetime-local"
				bind:value={$startProxy}
				min={$constraints.start?.min?.toString().slice(0, 16)}
			/>
		</Form.Control>
	</Form.Field>

	<Form.Field {form} name="end">
		<Form.Control let:attrs>
			<Form.Label>End Time</Form.Label>
			<Input
				{...attrs}
				type="datetime-local"
				bind:value={$endProxy}
				min={$constraints.end?.min?.toString().slice(0, 16)}
			/>
		</Form.Control>
	</Form.Field>

	<Form.Field {form} name="image" class="mb-2">
		<Form.Control let:attrs>
			<Form.Label>Image {$formData.image ? '(Image uploaded)' : ''}</Form.Label>
			<Input class="text-neutral" type="file" on:input={(e) => handleUpload(e)} />
			<Input class="hidden" {...attrs} bind:value={$formData.image} />
		</Form.Control>
	</Form.Field>

	<Form.Field {form} name="formId" class="flex flex-col">
		<Popover.Root bind:open let:ids>
			<Form.Control let:attrs>
				<Form.Label>Attendance Form</Form.Label>
				<Popover.Trigger
					class={cn(
						buttonVariants({ variant: 'outline' }),
						'w-[200px] justify-between',
						!$formData.formId && 'text-muted-foreground'
					)}
					role="combobox"
					{...attrs}
				>
					{forms.find((f) => f.id === $formData.formId)?.name ?? 'Select form'}
					<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Popover.Trigger>
				<input hidden value={$formData.formId} name={attrs.name} />
			</Form.Control>
			<Popover.Content class="w-[200px] p-0">
				<Command.Root>
					<Command.Input autofocus placeholder="Search form..." class="h-9" />
					<Command.Empty>No form found.</Command.Empty>
					<Command.Group>
						{#each forms as userForm}
							<Command.Item
								value={userForm.id}
								onSelect={() => {
									$formData.formId = userForm.id;
									closeAndFocusTrigger(ids.trigger);
								}}
							>
								{userForm.name}
								<Check
									class={cn(
										'ml-auto h-4 w-4',
										userForm.id !== $formData.formId && 'text-transparent'
									)}
								/>
							</Command.Item>
						{/each}
					</Command.Group>
				</Command.Root>
			</Popover.Content>
		</Popover.Root>
	</Form.Field>

	<Form.Field {form} name="tags" class="mb-2">
		<Form.Control let:attrs>
			<Form.Label>Tags</Form.Label>
			<MultiSelect
				{...attrs}
				bind:selected={$formData.tags}
				options={default_tags}
				allowUserOptions={true}
				outerDivClass={'!flex !h-auto !w-full !items-center !justify-between !rounded-md !border !border-input !bg-background !px-3 !py-2 !text-sm !ring-offset-background placeholder:!text-muted-foreground focus:!outline-none focus:!ring-2 focus:!ring-ring focus:!ring-offset-2 disabled:!cursor-not-allowed disabled:!opacity-50 [&>span]:!line-clamp-1'}
				liSelectedClass={badgeVariants({ variant: 'outline' })}
				liOptionClass="!relative !flex !w-full !cursor-default !select-none !items-center !rounded-sm !py-1.5 !pl-8 !pr-2 !text-sm !outline-none data-[highlighted]:!bg-accent data-[highlighted]:!text-accent-foreground data-[disabled]:!pointer-events-none data-[disabled]:!opacity-50"
				ulOptionsClass={' !z-50 !min-w-[8rem] !overflow-hidden! rounded-md border !bg-popover !text-popover-foreground !shadow-md !outline-none'}
				allowEmpty={true}
			/>
		</Form.Control>
	</Form.Field>

	<Form.Button>{actionType === 'create' ? 'Create' : 'Update'}</Form.Button>
	<!-- 
	{#if browser}
		<SuperDebug data={$formData} />
	{/if} -->
</form>
