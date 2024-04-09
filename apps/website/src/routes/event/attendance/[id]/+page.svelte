<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Alert from '$lib/components/ui/alert';
	import Preview from '$lib/components/custom/form/UI/Preview.svelte';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { page } from '$app/stores';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { PUBLIC_URL } from '$env/static/public';
	export let data;
	let filled = data.formFilled;

	const invalid = data.formFilled || new Date() > data.event.end || new Date() < data.event.start;

	onMount(() => {
		setTimeout(() => {
			const callbackUrl = $page.url.searchParams.get('callbackUrl');
			const returnURL = new URL(callbackUrl ?? PUBLIC_URL);
			if (invalid && callbackUrl) {
				window.location.href = returnURL.toString();
			}
		}, 7000);
	});
</script>

{#if filled}
	<Alert.Root>
		<Alert.Title>Attendance Already Filled!</Alert.Title>
		<Alert.Description>You've probably filled this attendance before</Alert.Description>
	</Alert.Root>
{/if}

{#if new Date() > data.event.end}
	<Alert.Root>
		<Alert.Title>Event has already ended</Alert.Title>
		<Alert.Description>Events can't be filled after they have ended</Alert.Description>
	</Alert.Root>
{/if}

{#if new Date() < data.event.start}
	<Alert.Root>
		<Alert.Title>Event hasn't yet started</Alert.Title>
		<Alert.Description>Come back and fill this form when the event begins</Alert.Description>
	</Alert.Root>
{/if}
<div class="flex flex-col justify-center items-center h-[100vh] gap-3">
	<div>
		{#if data.event.organization.logo}
			<img
				src={data.event.organization.logo}
				alt="Organization"
				width="100"
				height="100"
				class="mx-auto"
			/>
		{/if}

		<p class="text-center font-bold text-xl">{data.event.organization.name}</p>
	</div>
	<form method="post">
		<Card.Root class="w-[350px] relative">
			<div
				class=" text-sm bg-secondary rounded-tl-md rounded-br-md font-semibold px-4 py-2 flex items-start w-20 gap-0.5"
			>
				<img src="/logo.svg" alt="Logo" class="h-4 w-4" />
				Jonze
			</div>

			<div class="relative flex items-start space-x-4 p-4">
				<Avatar.Root class="w-10 h-10 border">
					<Avatar.Image src={data.user.profilePictureUrl} />
					<Avatar.Fallback
						>{(data.user.firstName?.charAt(0) ?? 'U') +
							(data.user.lastName?.charAt(0) ?? '')}</Avatar.Fallback
					>
				</Avatar.Root>
				<div class="text-sm grid gap-1">
					<Card.Title class="text-base font-semibold">
						{(data.user.firstName ?? 'No') + ' ' + (data.user.lastName ?? 'Name')}
					</Card.Title>
					<Card.Description class="text-sm">
						{data.user.email}
					</Card.Description>
				</div>
			</div>
			<Card.Header>
				<Card.Title>Attendance for "{data.event.name}"</Card.Title>
			</Card.Header>
			<Card.Content>
				{#if data.event.form}
					<Preview form={data.event.form.form} userResponse={undefined} />
				{/if}
			</Card.Content>
			<Card.Footer class="flex justify-center">
				<Button disabled={invalid} type="submit">Mark Attendance</Button>
			</Card.Footer>
		</Card.Root>
	</form>
</div>
