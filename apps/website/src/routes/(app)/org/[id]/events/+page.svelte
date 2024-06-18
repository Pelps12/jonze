<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Drawer from '$lib/components/ui/drawer';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { mediaQuery } from 'svelte-legos';
	import EventForm from './EventForm.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Copy, FileDown, MoreHorizontal, PlusIcon, QrCode } from 'lucide-svelte';
	import { browser } from '$app/environment';
	import { PUBLIC_URL } from '$env/static/public';
	import { toast } from 'svelte-sonner';
	import Preview from '$lib/components/custom/form/UI/Preview.svelte';
	import QRCode from 'qrcode';
	import { writable } from 'svelte/store';
	import UpdateEventForm from './UpdateEventForm.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import * as Alert from '$lib/components/ui/alert';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { enhance } from '$app/forms';
	import { Image } from '@unpic/svelte';
	import { json2csv } from 'json-2-csv';
	import type { PageData } from './$types';
	import * as Select from '$lib/components/ui/select';

	import { Calendar } from '@fullcalendar/core';
	import dayGridPlugin from '@fullcalendar/daygrid';
	import timeGridPlugin from '@fullcalendar/timegrid';
	import listPlugin from '@fullcalendar/list';
	import { cn } from '$lib/utils';
	import { Badge } from '$lib/components/ui/badge';
	let newFormOpen = $page.url.searchParams.has('newevent');

	const calendarEvents = [
		{ title: 'Team Meeting', start: '2024-06-15T09:00:00', end: '2024-06-15T10:00:00' },
		{ title: 'Lunch with Sarah', start: '2024-06-16T12:00:00', end: '2024-06-16T13:00:00' },
		{ title: 'Conference', start: '2024-06-20', end: '2024-06-23' },
		{ title: 'Webinar', start: '2024-06-18T15:00:00', end: '2024-06-18T17:00:00' },
		{ title: 'Doctor Appointment', start: '2024-06-19T11:00:00', end: '2024-06-19T12:00:00' },
		{ title: 'Workshop', start: '2024-06-21' },
		{ title: 'Birthday Party', start: '2024-06-24T19:00:00', end: '2024-06-24T23:00:00' },
		{ title: 'Yoga Class', start: '2024-06-25T07:00:00', end: '2024-06-25T08:00:00' },
		{ title: 'Software Release', start: '2024-06-27T00:00:00' }, // All-day event
		{ title: 'Annual General Meeting', start: '2024-06-29T10:00:00', end: '2024-06-29T12:00:00' },
		{ title: 'Project Kickoff', start: '2024-07-01T09:00:00', end: '2024-07-01T10:30:00' },
		{ title: 'Dentist Appointment', start: '2024-07-03T15:00:00', end: '2024-07-03T16:00:00' },
		{ title: 'Independence Day Party', start: '2024-07-04' }, // All-day event
		{ title: 'Team Lunch', start: '2024-07-08T12:00:00', end: '2024-07-08T13:00:00' },
		{ title: 'Client Review Meeting', start: '2024-07-10T11:00:00', end: '2024-07-10T12:30:00' },
		{ title: 'Software Training', start: '2024-07-15T09:00:00', end: '2024-07-15T17:00:00' },
		{ title: 'Book Club', start: '2024-07-17T19:00:00', end: '2024-07-17T20:30:00' },
		{ title: 'Family BBQ', start: '2024-07-20' }, // All-day event
		{ title: 'Quarterly Review', start: '2024-07-22T10:00:00', end: '2024-07-22T12:00:00' },
		{ title: 'Yoga Class', start: '2024-07-25T18:00:00', end: '2024-07-25T19:00:00' },
		{ title: 'Marketing Presentation', start: '2024-07-28T14:00:00', end: '2024-07-28T15:30:00' },
		{ title: 'Tech Meetup', start: '2024-07-30T18:00:00', end: '2024-07-30T20:00:00' },
		{ title: 'Summer Concert', start: '2024-07-31T20:00:00', end: '2024-07-31T23:00:00' }
	];

	const isDesktop = mediaQuery('(min-width: 768px)');
	const handleCopyAttendance = (eventId: string) => {
		if (browser) {
			navigator.clipboard.writeText(`${PUBLIC_URL}/event/attendance/${eventId}`).then(() => {
				toast.success('Attendance Link added to Clipboard');
			});
		}
	};

	const createQRCode = async (fileName: string, link: string) => {
		if (browser) {
			const aElement = document.createElement('a');
			aElement.setAttribute('download', fileName);
			const href = await QRCode.toDataURL(link, {
				width: 800
			});
			aElement.href = href;
			aElement.setAttribute('target', '_blank');
			aElement.click();
			URL.revokeObjectURL(href);
		}
	};

	const handleExport = async (events: PageData['events'], filename: string) => {
		const csv = json2csv(events, {
			expandNestedObjects: true,
			expandArrayObjects: true
		});

		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

		// Create a link element for the download
		const link = document.createElement('a');
		const url = URL.createObjectURL(blob);
		link.setAttribute('href', url);
		link.setAttribute('download', filename);
		link.style.visibility = 'hidden';

		// Append to the document and trigger the download
		document.body.appendChild(link);
		link.click();

		// Clean up
		document.body.removeChild(link);
		window.URL.revokeObjectURL(url);
	};

	export let data;

	onMount(() => {
		console.log(data.updateForms);
	});

	let editFormOpen: Record<string, boolean> = data.events.reduce(
		(o, { id }) => Object.assign(o, { [id]: false }),
		{}
	);

	let selectedView = writable({ label: 'List View', value: 'list' });

	onMount(() => {
		var calendarEl = document.getElementById('calendar');
		console.log(calendarEl);
		if (calendarEl) {
			const calendar = new Calendar(calendarEl, {
				initialView: 'dayGridMonth',
				plugins: [dayGridPlugin, timeGridPlugin, listPlugin],
				events: data.events.map((event) => ({ title: event.name, ...event })),
				headerToolbar: {
					left: 'prev,next today',
					center: 'title',

					right: 'dayGridMonth,timeGridWeek,listWeek'
				}
			});
			calendar.render();
		}
	});
</script>

{#if !data.events.find((event) => !!event.form)}
	<Alert.Root class="mb-2">
		<Alert.Title>Quick Tip!</Alert.Title>
		<Alert.Description
			>You can add <a
				class="underline pointer-events-auto"
				href={`/org/${$page.params.id}/forms/create`}>a feedback form</a
			> and attach it on event creation 😉</Alert.Description
		>
	</Alert.Root>
{/if}

<div class="flex justify-between items-center mb-6">
	<h2 class="text-xl font-semibold">Events</h2>
	<div class="flex space-x-2">
		{#await data.forms}
			<Button disabled>Add Event</Button>
		{:then forms}
			<Select.Root portal={null} bind:selected={$selectedView}>
				<Select.Trigger class="w-[150px]">
					<Select.Value placeholder="Select a fruit" />
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						<Select.Item value="list" label="List View">List View</Select.Item>
						<Select.Item value="calendar" label="Calendar View">Calendar View</Select.Item>
					</Select.Group>
				</Select.Content>
				<Select.Input name="favoriteFruit" />
			</Select.Root>
			<Button variant="outline" on:click={() => handleExport(data.events, 'events.csv')}
				><FileDown class="h-4 w-4 mr-2" /><span class="hidden sm:block">Export</span></Button
			>
			{#if $isDesktop}
				<Dialog.Root bind:open={newFormOpen}>
					<Dialog.Trigger asChild let:builder>
						<Button builders={[builder]} class=" justify-center lg:justify-start gap-2">
							<PlusIcon class="h-4 w-4" />
							<span class="hidden lg:block">Add Event</span>
						</Button>
					</Dialog.Trigger>
					<Dialog.Content class="sm:max-w-[425px]">
						<Dialog.Header>
							<Dialog.Title>Create your Event</Dialog.Title>
							<Dialog.Description>Allow members mark attendance on your events</Dialog.Description>
						</Dialog.Header>
						<EventForm data={data.form} event={undefined} {forms} formOpen={newFormOpen} />
					</Dialog.Content>
				</Dialog.Root>
			{:else}
				<Drawer.Root bind:open={newFormOpen}>
					<Drawer.Trigger asChild let:builder>
						<Button builders={[builder]} class=" justify-center lg:justify-start gap-2">
							<PlusIcon class="h-4 w-4" />
							<span class="hidden lg:block">Add Event</span>
						</Button>
					</Drawer.Trigger>
					<Drawer.Content class="p-4">
						<Drawer.Header class="text-left">
							<Drawer.Title>Create your Event</Drawer.Title>
							<Drawer.Description>Allow members mark attendance on your events</Drawer.Description>
						</Drawer.Header>
						<EventForm data={data.form} event={undefined} {forms} formOpen={newFormOpen} />
						<Drawer.Footer class="pt-2">
							<Drawer.Close asChild let:builder>
								<Button variant="outline" builders={[builder]}>Cancel</Button>
							</Drawer.Close>
						</Drawer.Footer>
					</Drawer.Content>
				</Drawer.Root>
			{/if}
		{/await}
	</div>
</div>

{#if data.events.length == 0}
	<div
		class="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-[60vh]"
	>
		<div class="flex flex-col items-center gap-1 text-center">
			<h3 class="text-2xl font-bold tracking-tight">You have no events</h3>
			<p class="text-sm text-muted-foreground">
				Members can start marking attendace when you create an event.
			</p>
			<Button on:click={() => (newFormOpen = true)} class="mt-4">Add Event</Button>
		</div>
	</div>
{:else}
	<div class={cn(' shadow rounded-lg p-6 hidden', $selectedView.value === 'list' && 'block')}>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each data.events as event}
				<Card.Root class="w-full">
					<Card.Header>
						<Card.Title class="flex justify-between">
							<div class="flex items-center gap-2">
								<p>{event.name}</p>
								{#if event.tags}
									{#each event.tags.names as tagName}
										<Badge class="my-2" variant="outline">{tagName}</Badge>
									{/each}
								{/if}
							</div>

							<Dialog.Root>
								<DropdownMenu.Root>
									<DropdownMenu.Trigger asChild let:builder>
										<Button
											variant="ghost"
											builders={[builder]}
											class="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
										>
											<MoreHorizontal class="h-4 w-4" />
											<span class="sr-only">Open menu</span>
										</Button>
									</DropdownMenu.Trigger>

									<DropdownMenu.Content class="w-[200px]" align="end">
										<DropdownMenu.Item
											on:click={() => handleCopyAttendance(event.id)}
											class="justify-between"
										>
											<span>Attendance Link</span>
											<Copy class="ml-2 h-4 w-4" />
										</DropdownMenu.Item>

										<DropdownMenu.Item
											class="justify-between"
											on:click={() =>
												createQRCode(
													`${event.name} - QR Code`,
													`${PUBLIC_URL}/event/attendance/${event.id}`
												)}
										>
											<span>Attendance QRCode</span>
											<QrCode class="ml-2 h-4 w-4" />
										</DropdownMenu.Item>
										{#if event.formId}
											<DropdownMenu.Item
												href={`/org/${$page.params.id}/forms/${event.formId}/responses?eventId=${event.id}`}
											>
												Form Responses
											</DropdownMenu.Item>
										{/if}
										<DropdownMenu.Item href={`events/${event.id}`}
											>View Attendance</DropdownMenu.Item
										>
									</DropdownMenu.Content>

									{#if event.form}
										<Dialog.Content class="sm:max-w-[425px]">
											<Dialog.Header>
												<Dialog.Title>{event.form.name}</Dialog.Title>
												<Dialog.Description>Form attached to event attendance</Dialog.Description>
											</Dialog.Header>

											<Preview form={event.form.form} userResponse={undefined} />
										</Dialog.Content>
									{/if}
								</DropdownMenu.Root>
							</Dialog.Root>
						</Card.Title>
						<Card.Description
							>{new Date(event.start).toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'long',
								day: 'numeric'
							})}</Card.Description
						>
					</Card.Header>
					<div class="flex justify-center rounded-lg m-3">
						{#if event.image}
							<Image
								src={event.image}
								layout="fullWidth"
								height={350}
								priority={false}
								alt={event.name}
								class="aspect-square object-cover m-5 w-auto rounded-lg"
							/>
						{:else}
							<img
								src={'/placeholder.svg'}
								height={350}
								alt={event.name}
								class="aspect-square object-cover m-5 w-auto rounded-lg"
							/>
						{/if}
					</div>
					<Card.Content>
						<p class="text-sm text-gray-600">
							{event.description}
						</p>
					</Card.Content>
					<Card.Footer class="flex justify-between">
						{#await data.forms}
							<Button variant="outline" disabled>Edit</Button>
						{:then forms}
							{#if $isDesktop}
								<Dialog.Root
									open={editFormOpen[event.id]}
									onOpenChange={(e) => (editFormOpen[event.id] = e)}
								>
									<Dialog.Trigger asChild let:builder>
										<Button variant="outline" builders={[builder]}>Edit</Button>
									</Dialog.Trigger>
									<Dialog.Content class="sm:max-w-[425px]">
										<Dialog.Header>
											<Dialog.Title>Update your Event</Dialog.Title>
											<Dialog.Description>
												Allow members mark attendance on your events
											</Dialog.Description>
										</Dialog.Header>

										<UpdateEventForm
											{forms}
											data={data.updateForms.find((form) => form.id === event.id)}
											{event}
											actionType="update"
										/>
									</Dialog.Content>
								</Dialog.Root>
							{:else}
								<Drawer.Root
									open={editFormOpen[event.id]}
									onOpenChange={(e) => (editFormOpen[event.id] = e)}
								>
									<Drawer.Trigger asChild let:builder>
										<Button variant="outline" builders={[builder]}>Edit</Button>
									</Drawer.Trigger>
									<Drawer.Content class="p-4">
										<Drawer.Header class="text-left">
											<Drawer.Title>Update your Event</Drawer.Title>
											<Drawer.Description>
												Allow members mark attendance on your events
											</Drawer.Description>
										</Drawer.Header>
										<UpdateEventForm
											{forms}
											data={data.updateForms.find((form) => form.id === event.id)}
											{event}
											actionType="update"
										/>
										<Drawer.Footer class="pt-2">
											<Drawer.Close asChild let:builder>
												<Button variant="outline" builders={[builder]}>Cancel</Button>
											</Drawer.Close>
										</Drawer.Footer>
									</Drawer.Content>
								</Drawer.Root>
							{/if}
						{/await}

						<AlertDialog.Root>
							<AlertDialog.Trigger asChild let:builder>
								<Button variant="destructive" builders={[builder]}>Delete</Button>
							</AlertDialog.Trigger>
							<AlertDialog.Content>
								<AlertDialog.Header>
									<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
									<AlertDialog.Description>
										This action cannot be undone. This will permanently delete the event, associated
										attendances and responses.
									</AlertDialog.Description>
								</AlertDialog.Header>
								<AlertDialog.Footer>
									<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
									<form
										action="?/delete"
										method="post"
										use:enhance={({ formElement, formData, action, cancel, submitter }) => {
											// `formElement` is this `<form>` element
											// `formData` is its `FormData` object that's about to be submitted
											// `action` is the URL to which the form is posted
											// calling `cancel()` will prevent the submission
											// `submitter` is the `HTMLElement` that caused the form to be submitted

											return async ({ result, update }) => {
												// `result` is an `ActionResult` object
												// `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
												toast.success('Event successfully deleted');
											};
										}}
									>
										<input type="text" name="id" id="" class="hidden" value={event.id} />
										<AlertDialog.Action
											type="submit"
											class={buttonVariants({ variant: 'destructive' })}
											>Continue</AlertDialog.Action
										>
									</form>
								</AlertDialog.Footer>
							</AlertDialog.Content>
						</AlertDialog.Root>
					</Card.Footer>
				</Card.Root>
			{/each}
		</div>
	</div>

	<div class={cn('relative hidden', $selectedView.value === 'calendar' && 'block')}>
		<div id="calendar" class="m-0 p-0 w-full h-[80vh]"></div>
		<div class="absolute right-0">
			{#if browser}
				<div
					class=" text-sm bg-secondary rounded-bl-md rounded-br-md font-semibold px-4 py-2 flex items-start w-20 gap-0.5"
				>
					<img src="/logo.svg" alt="Logo" class="h-4 w-4" />
					Jonze
				</div>
			{/if}
		</div>
	</div>
{/if}
