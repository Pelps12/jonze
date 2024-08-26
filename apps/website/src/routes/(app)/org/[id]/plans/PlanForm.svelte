<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { planCreationSchema, type PlanCreationSchema, intervals } from '$lib/formSchema/plan';
	import {
		type SuperValidated,
		type Infer,
		superForm,
		dateProxy,
		numberProxy
	} from 'sveltekit-superforms';
	import { Input } from '$lib/components/ui/input';

	import { tick } from 'svelte';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Select from '$lib/components/ui/select';

	import { CalendarIcon, Check, ChevronsUpDown, LoaderCircle } from 'lucide-svelte';
	import {
		CalendarDate,
		DateFormatter,
		getLocalTimeZone,
		today,
		type DateValue
	} from '@internationalized/date';
	import * as Popover from '$lib/components/ui/popover';
	import { buttonVariants } from '$lib/components/ui/button';
	import { Calendar } from '$lib/components/ui/calendar';
	import { trpc } from '$lib/client/trpc';
	import { page } from '$app/stores';
	import posthog from 'posthog-js';
	import { cn } from '$lib/utils';
	import * as Command from '$lib/components/ui/command';
	import type { RouterOutput } from '$lib/server/trpc/routes';

	export let data: SuperValidated<Infer<PlanCreationSchema>>;
	export let forms: RouterOutput['planRouter']['getPlans']['availableForms'];
	export let actionType: 'create' | 'update' = 'create';
	export let closeForm: () => void;

	let membershipFormFlagEnabled = false;

	posthog.onFeatureFlags(() => {
		if (posthog.isFeatureEnabled('membership-forms')) {
			membershipFormFlagEnabled = true;
		}
	});

	const planCreationMutation = trpc().planRouter.createPlan.createMutation();
	const utils = trpc().createUtils();

	const form = superForm(data, {
		SPA: true,
		validators: zodClient(planCreationSchema),
		dataType: 'json',
		onUpdate: async ({ form }) => {
			if (form.valid) {
				// TODO: Call an external API with form.data, await the result and update form
				console.log(form.data);
				await $planCreationMutation.mutateAsync({
					orgId: $page.params.id,
					...form.data
				});
				await utils.planRouter.getPlans.invalidate();
				closeForm();
			}
		}
	});

	const { form: formData, enhance } = form;

	let open = false;

	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}
	const amountProxy = numberProxy(form, 'amount', { delimiter: '.' });

	$: selectedInterval = {
		label: intervals[$formData.interval],
		value: $formData.interval
	};

	form.errors.subscribe((err) => console.log(err));
	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});

	let value: DateValue | undefined;

	$: value = $formData.start
		? new CalendarDate(
				$formData.start.getFullYear(),
				$formData.start.getMonth() + 1,
				$formData.start.getDate()
			)
		: undefined;

	let placeholder: DateValue = today(getLocalTimeZone());
</script>

<form
	method="POST"
	use:enhance
	enctype="multipart/form-data"
	class="p-4"
	action={actionType === 'update' ? '?/update' : '?/create'}
>
	<Form.Field {form} name="name">
		<Form.Control let:attrs>
			<Form.Label>Name</Form.Label>
			<Input {...attrs} bind:value={$formData.name} placeholder="Name of the Plan" />
		</Form.Control>
	</Form.Field>

	<Form.Field {form} name="amount" class="mb-2">
		<Form.Control let:attrs>
			<Form.Label>Amount</Form.Label>
			<Input
				{...attrs}
				type="number"
				placeholder="Cost of Membership Plan"
				bind:value={$amountProxy}
			/>
		</Form.Control>
	</Form.Field>

	<!-- 	<Form.Field {form} name="start">
		<Form.Control let:attrs>
			<Form.Label>Expiry Date (ignore the year it will auto reset)</Form.Label>
			<Input
				{...attrs}
				type="date"
				bind:value={$startProxy}
				min={$constraints.start?.min?.toString().slice(0, 16)}
			/>
		</Form.Control>
	</Form.Field> -->

	<Form.Field {form} name="start" class="flex flex-col">
		<Form.Control let:attrs>
			<Form.Label>Expiry Date</Form.Label>
			<Popover.Root>
				<Popover.Trigger
					{...attrs}
					class={cn(
						buttonVariants({ variant: 'outline' }),
						'w-[280px] justify-start pl-4 text-left font-normal',
						!value && 'text-muted-foreground'
					)}
				>
					{value ? df.format(value.toDate(getLocalTimeZone())) : 'Pick a date'}
					<CalendarIcon class="ml-auto h-4 w-4 opacity-50" />
				</Popover.Trigger>
				<Popover.Content class="w-auto p-0" side="top">
					<Calendar
						{value}
						bind:placeholder
						minValue={new CalendarDate(1900, 1, 1)}
						calendarLabel="Date of birth"
						initialFocus
						onValueChange={(v) => {
							if (v) {
								$formData.start = v.toDate(getLocalTimeZone());
							} else {
								console.log('HWHHEEH');
							}
						}}
					/>
				</Popover.Content>
			</Popover.Root>

			<Form.FieldErrors />
			<input hidden value={$formData.start} name={attrs.name} />
		</Form.Control>
	</Form.Field>

	<Form.Field {form} name="interval" class="mb-2">
		<Form.Control let:attrs>
			<Form.Label>Duration</Form.Label>
			<Select.Root
				selected={selectedInterval}
				onSelectedChange={(v) => {
					v && ($formData.interval = v.value);
				}}
			>
				<Select.Trigger {...attrs}>
					<Select.Value placeholder="Select a verified email to display" />
				</Select.Trigger>
				<Select.Content>
					{#each Object.entries(intervals) as [value, label]}
						<Select.Item {value} {label} />
					{/each}
				</Select.Content>
			</Select.Root>
			<input hidden bind:value={$formData.interval} name={attrs.name} />
		</Form.Control>

		<Form.FieldErrors />
	</Form.Field>

	{#if membershipFormFlagEnabled}
		<Form.Field {form} name="formId" class="flex flex-col mb-2">
			<Popover.Root bind:open let:ids>
				<Form.Control let:attrs>
					<Form.Label>Membership Form (Optional)</Form.Label>
					<Popover.Trigger
						class={cn(
							buttonVariants({ variant: 'outline' }),
							'w-[200px] justify-between',
							!$formData.formId && 'text-muted-foreground'
						)}
						role="combobox"
						{...attrs}
					>
						{forms?.find((f) => f.id === $formData.formId)?.name ?? 'Select form'}
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
	{/if}

	<Form.Button class="w-full" disabled={$planCreationMutation.isPending}
		>{#if $planCreationMutation.isPending}
			<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
		{/if}Create</Form.Button
	>
</form>
