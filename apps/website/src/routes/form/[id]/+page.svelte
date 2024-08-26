<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Alert from '$lib/components/ui/alert';
	import Preview from '$lib/components/custom/form/UI/Preview.svelte';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import Form from '$lib/components/custom/form/UI/Form.svelte';

	import { onMount } from 'svelte';
	import posthog from 'posthog-js';
	import { PUBLIC_ENVIRONMENT } from '$env/static/public';
	export let data;

	let newGraphFlagEnabled = PUBLIC_ENVIRONMENT === 'dev';
	onMount(() => {
		posthog.onFeatureFlags(() => {
			if (posthog.isFeatureEnabled('new-form-validation')) {
				newGraphFlagEnabled = true;
			}
		});
	});
</script>

<div class="flex flex-col justify-center items-center h-[100vh] gap-3">
	<div>
		{#if data.form.organization.logo}
			<img
				src={data.form.organization.logo}
				alt="Organization"
				width="100"
				height="100"
				class="mx-auto"
			/>
		{/if}

		<p class="text-center font-bold text-xl">{data.form.organization.name}</p>
	</div>

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
			<Card.Title>{data.form.name}</Card.Title>
		</Card.Header>
		<Card.Content>
			{#if newGraphFlagEnabled}
				<Form dataForm={data.modifiedForm} schema={data.zodForm} />
			{:else}
				<form method="post">
					<Preview form={data.form.form} userResponse={undefined} />
				</form>
			{/if}
		</Card.Content>
		{#if !newGraphFlagEnabled}
			<Card.Footer class="flex justify-center">
				<Button type="submit">Submit</Button>
			</Card.Footer>
		{/if}
	</Card.Root>
</div>
