<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Drawer from '$lib/components/ui/drawer';
	import { Input } from '$lib/components/ui/input';
	import { mediaQuery } from 'svelte-legos';
	import EventForm from './EventForm.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Copy, CopyPlus, FileDown, MoreHorizontal, PlusIcon, QrCode, XIcon } from 'lucide-svelte';
	import { browser } from '$app/environment';
	import { PUBLIC_URL } from '$env/static/public';
	import { toast } from 'svelte-sonner';
	import Preview from '$lib/components/custom/form/UI/Preview.svelte';
	import QRCode from 'qrcode';
	import { derived, writable } from 'svelte/store';
	import UpdateEventForm from './UpdateEventForm.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import * as Alert from '$lib/components/ui/alert';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { enhance } from '$app/forms';
	import { Image } from '@unpic/svelte';
	import { json2csv } from 'json-2-csv';
	import * as Select from '$lib/components/ui/select';
	import { Chart, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
	import { Bar } from 'svelte-chartjs';
	import { Calendar } from '@fullcalendar/core';
	import dayGridPlugin from '@fullcalendar/daygrid';
	import timeGridPlugin from '@fullcalendar/timegrid';
	import listPlugin from '@fullcalendar/list';
	import { cn } from '$lib/utils';
	import { Badge } from '$lib/components/ui/badge';
	import type { ArrayElement } from '$lib/types/misc';
	import { mode } from 'mode-watcher';
	import { trpc } from '$lib/client/trpc';
	import type { RouterOutput } from '$lib/server/trpc/routes';
	import { goto } from '$app/navigation';

	const queryParams = derived(page, ($page) => ({
		orgId: $page.params.id,
		name: $page.url.searchParams.get('name'),
		tag: $page.url.searchParams.get('tag')
	}));

	$: eventQuery = trpc().eventRouter.getEvents.createQuery($queryParams);
	const deleteEventMutation = trpc().eventRouter.deleteEvent.createMutation();

	let newFormOpen = $page.url.searchParams.has('newevent');

	let selectedEvent: ArrayElement<RouterOutput['eventRouter']['getEvents']['events']> | undefined =
		undefined;

	const handleOpenDuplicate = (eventId: string) => {
		const duplicatedEvent = $eventQuery.data?.events.find((event) => event.id === eventId);
		if (!duplicatedEvent) {
			toast.error('Event not found');
		} else {
			selectedEvent = duplicatedEvent;
			newFormOpen = true;
		}
	};

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

	const handleExport = async (
		events: RouterOutput['eventRouter']['getEvents']['events'],
		filename: string
	) => {
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

	let editFormOpen: Record<string, boolean>;

	$: editFormOpen = $eventQuery.data
		? $eventQuery.data?.events?.reduce((o, { id }) => Object.assign(o, { [id]: false }), {})
		: {};

	let selectedView = writable({ label: 'List View', value: 'list' });

	onMount(() => {});

	let selected: any = undefined;
	const defaultFilters = ['name', 'tag'];
	const nameFilter = $page.url.searchParams.get('name');
	const tagFilter = $page.url.searchParams.get('tag');
	const filterValue = writable<string>();
	if (nameFilter) {
		selected = {
			value: 'name',
			label: 'Name'
		};
		filterValue.set(nameFilter);
	} else if (tagFilter) {
		selected = {
			value: 'tag',
			label: 'Tag'
		};

		filterValue.set(tagFilter);
	}

	const removeAllFilters = (url: URL) => {
		url.searchParams.delete('tag');
		url.searchParams.delete('name');

		return url;
	};

	const handleFilterSubmit = async () => {
		if (selected && selected.value) {
			const url = removeAllFilters(new URL($page.url));
			if (defaultFilters.includes(selected.value)) {
				url.searchParams.set(selected.value, $filterValue);
			} else {
				url.searchParams.set('custom_type', selected.value);
				url.searchParams.set('custom_value', $filterValue);
			}

			goto(url.toString());

			//$page.url.searchParams.set('email', $emailFilter);
		} else {
			toast.warning('Pick a filter');
		}
	};

	const handleReset = () => {
		const url = removeAllFilters(new URL($page.url));
		goto(url.toString());
	};

	Chart.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

	Chart.defaults.font.family = 'Onest';

	const isLight = derived(mode, ($mode) => $mode === 'light');

	isLight.subscribe((a) => console.log(a));

	const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

	let chartData: {
		labels: string[];
		datasets: {
			label: string;
			data: number[];
			borderColor: string;
			backgroundColor: string;
			borderWidth: number;
			borderRadius: number;
			borderSkipped: boolean;
		}[];
	};
	$: chartData = {
		labels: $eventQuery.data?.chartData?.labels ?? [],
		datasets: [
			{
				label: 'Attendance',
				data: $eventQuery.data?.chartData.data ?? [],
				borderColor: $isLight ? '#000' : '#fff',
				backgroundColor: $isLight ? '#000' : '#fff',
				borderWidth: 0,
				borderRadius: 5,
				borderSkipped: false
			}
		]
	};

	selectedView.subscribe((view) => {
		if (view.value === 'calendar') {
			setTimeout(() => {
				var calendarEl = document.getElementById('calendar');
				console.log(calendarEl);
				if (calendarEl) {
					const calendar = new Calendar(calendarEl, {
						initialView: 'dayGridMonth',
						plugins: [dayGridPlugin, timeGridPlugin, listPlugin],
						events: $eventQuery.data?.events.map((event) => ({
							title: event.name,
							...event,
							url: `${PUBLIC_URL}/org/${$page.params.id}/events/${event.id}`
						})),
						headerToolbar: {
							left: 'prev,next today',
							center: 'title',

							right: 'dayGridMonth,timeGridWeek,listWeek'
						},
						eventInteractive: true
					});
					calendar.render();
				}
			}, 100);
		}
	});
</script>

{#if $eventQuery.data}
	{#if !$eventQuery.data.events.find((event) => !!event.form)}
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
			{#await $eventQuery.data.forms}
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
							<Select.Item value="graph" label="Graph View">Graph View</Select.Item>
						</Select.Group>
					</Select.Content>
					<Select.Input name="favoriteFruit" />
				</Select.Root>
				<Button
					variant="outline"
					on:click={() => handleExport($eventQuery.data.events, 'events.csv')}
					><FileDown class="h-4 w-4 mr-2" /><span class="hidden sm:block">Export</span></Button
				>
				{#if $isDesktop}
					<Dialog.Root bind:open={newFormOpen}>
						<Dialog.Trigger asChild let:builder>
							<Button
								builders={[builder]}
								class=" justify-center lg:justify-start gap-2"
								on:click={() => (selectedEvent = undefined)}
							>
								<PlusIcon class="h-4 w-4" />
								<span class="hidden lg:block">Add Event</span>
							</Button>
						</Dialog.Trigger>
						<Dialog.Content class="sm:max-w-[425px]">
							<Dialog.Header>
								<Dialog.Title>Create your Event</Dialog.Title>
								<Dialog.Description>Allow members mark attendance on your events</Dialog.Description
								>
							</Dialog.Header>
							<EventForm
								data={$eventQuery.data.form}
								event={selectedEvent}
								{forms}
								closeForm={() => (newFormOpen = false)}
							/>
						</Dialog.Content>
					</Dialog.Root>
				{:else}
					<Drawer.Root bind:open={newFormOpen}>
						<Drawer.Trigger asChild let:builder>
							<Button
								builders={[builder]}
								class=" justify-center lg:justify-start gap-2"
								on:click={() => (selectedEvent = undefined)}
							>
								<PlusIcon class="h-4 w-4" />
								<span class="hidden lg:block">Add Event</span>
							</Button>
						</Drawer.Trigger>
						<Drawer.Content class="p-4">
							<Drawer.Header class="text-left">
								<Drawer.Title>Create your Event</Drawer.Title>
								<Drawer.Description>Allow members mark attendance on your events</Drawer.Description
								>
							</Drawer.Header>
							<EventForm
								data={$eventQuery.data.form}
								event={selectedEvent}
								{forms}
								closeForm={() => (newFormOpen = false)}
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
		</div>
	</div>

	<form class="my-3 flex gap-2 flex-start">
		<Select.Root
			{selected}
			onSelectedChange={(e) => {
				selected = e;
			}}
		>
			<Select.Trigger class="w-[100px]">
				<Select.Value placeholder="Filter by" />
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="name">Name</Select.Item>
				<Select.Item value="tag">Tag</Select.Item>
			</Select.Content>
		</Select.Root>
		<Input
			bind:value={$filterValue}
			on:keydown={(e) => e.key === 'Enter' && handleFilterSubmit()}
			placeholder={`Filter ${!!selected?.label ? `by ${selected?.label}` : ''}`}
			class="max-w-md"
		/>
		<Button on:click={() => handleFilterSubmit()}>Apply</Button>
		<Button on:click={() => handleReset()} variant="outline">
			<XIcon class="w-4 h-4" />
			Reset
		</Button>
	</form>

	{#if $eventQuery.data.events.length == 0}
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
	{:else if $selectedView.value === 'list'}
		<div class={cn(' shadow rounded-lg p-6')}>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each $eventQuery.data.events as event}
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
											<DropdownMenu.Item
												on:click={() => handleOpenDuplicate(event.id)}
												class="justify-between"
											>
												<span>Duplicate Event</span>
												<CopyPlus class="ml-2 h-4 w-4" />
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
							{#await $eventQuery.data.forms}
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
												data={$eventQuery.data.updateForms.find((form) => form.id === event.id)}
												closeForm={() => (editFormOpen[event.id] = false)}
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
												data={$eventQuery.data.updateForms.find((form) => form.id === event.id)}
												closeForm={() => (editFormOpen[event.id] = false)}
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
											This action cannot be undone. This will permanently delete the event,
											associated attendances and responses.
										</AlertDialog.Description>
									</AlertDialog.Header>
									<AlertDialog.Footer>
										<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>

										<AlertDialog.Action
											type="button"
											on:click={async () => {
												await $deleteEventMutation.mutateAsync(
													{
														orgId: $page.params.id,
														eventId: event.id
													},
													{
														onSuccess: () => {}
													}
												);
												await trpc().createUtils().eventRouter.getEvents.invalidate();
											}}
											class={buttonVariants({ variant: 'destructive' })}
											>Continue</AlertDialog.Action
										>
									</AlertDialog.Footer>
								</AlertDialog.Content>
							</AlertDialog.Root>
						</Card.Footer>
					</Card.Root>
				{/each}
			</div>
		</div>
	{:else if $selectedView.value === 'calendar'}
		<div class={cn('relative')}>
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
	{:else}
		<div>
			<Bar
				data={chartData}
				on:click={(e) => console.log(e)}
				options={{
					maintainAspectRatio: false,
					aspectRatio: 1,
					scales: { x: { display: false }, y: { ticks: { stepSize: 1 } } }
				}}
			/>
		</div>
	{/if}
{/if}
