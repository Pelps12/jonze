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
	import { Copy, MoreHorizontal, QrCode } from 'lucide-svelte';
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
	let newFormOpen = $page.url.searchParams.has('newevent');

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

	export let data;

	onMount(() => {
		console.log(data.updateForms);
	});

	let editFormOpen: Record<string, boolean> = data.events.reduce(
		(o, { id }) => Object.assign(o, { [id]: false }),
		{}
	);
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
			{#if $isDesktop}
				<Dialog.Root bind:open={newFormOpen}>
					<Dialog.Trigger asChild let:builder>
						<Button builders={[builder]}>Add Event</Button>
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
						<Button builders={[builder]}>Add Event</Button>
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
	<div class=" shadow rounded-lg p-6">
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each data.events as event}
				<Card.Root class="w-full">
					<Card.Header>
						<Card.Title class="flex justify-between">
							<p>{event.name}</p>
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
						<img
							alt="Spring Festival"
							class=" aspect-square object-cover m-5 w-auto rounded-lg"
							height={350}
							src={event.image}
							placeholder={'/placeholder.svg'}
							width={350}
						/>
					</div>
					<Card.Content>
						<p class="text-sm text-gray-600">
							{event.description}
						</p>
					</Card.Content>
					<Card.Footer class="flex justify-between">
						{#await data.forms}
							<Button variant="outline" disabled>Add Event</Button>
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
{/if}
