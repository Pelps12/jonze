<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { planCreationSchema, type PlanCreationSchema, intervals } from './schema';
	import {
		type SuperValidated,
		type Infer,
		superForm,
		dateProxy,
		numberProxy
	} from 'sveltekit-superforms';
	import { Input } from '$lib/components/ui/input';
	import { client } from '$lib/client/uploadcare';
	import { parseISO, format } from 'date-fns';
	import enUS from 'date-fns/locale/en-US';
	import { formatInTimeZone } from 'date-fns-tz';
	import type { OrgForm, Event as dbEvent } from '@repo/db/types';
	import { onMount, tick } from 'svelte';
	import { browser } from '$app/environment';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Select from '$lib/components/ui/select';

	import { getAttrs } from 'bits-ui';
	import { cn } from '$lib/utils';
	import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-svelte';
	import type { Writable } from 'svelte/store';
	import {
		CalendarDate,
		DateFormatter,
		getLocalTimeZone,
		parseDate,
		toCalendarDate,
		today,
		type DateValue
	} from '@internationalized/date';
	import * as Popover from '$lib/components/ui/popover';
	import { buttonVariants } from '$lib/components/ui/button';
	import { Calendar } from '$lib/components/ui/calendar';
	import Error from '../+error.svelte';

	export let data: SuperValidated<Infer<PlanCreationSchema>>;
	export let actionType: 'create' | 'update' = 'create';

	function formatToBrowserTimeZone(date: Date) {
		// Format the date and time in the desired format, using the browser's timezone
		const formattedDate = formatInTimeZone(
			date,
			Intl.DateTimeFormat().resolvedOptions().timeZone,
			"yyyy-MM-dd'T'HH:mm"
		);
		console.log(formattedDate);
		return formattedDate;
	}

	const form = superForm(data, {
		validators: zodClient(planCreationSchema)
	});

	const { form: formData, enhance, constraints } = form;

	let open = false;

	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}
	const startProxy = dateProxy(form, 'start', { format: 'date' });
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

	<Form.Field {form} name="interval">
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
		<Form.Description>
			You can manage email address in your <a href="/examples/forms">email settings</a>.
		</Form.Description>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Button>{actionType === 'create' ? 'Create' : 'Update'}</Form.Button>
</form>
