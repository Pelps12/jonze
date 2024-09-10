<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Form from '$lib/components/ui/form';

	import NewForm from '$lib/components/custom/form/UI/Form.svelte';
	import { formSchema, type FormSchema } from '../schema';
	import type { ActionData } from './$types';
	import Preview from '$lib/components/custom/form/UI/Preview.svelte';
	import { applyAction, enhance } from '$app/forms';
	import { LoaderCircle } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { PUBLIC_ENVIRONMENT } from '$env/static/public';
	import posthog from 'posthog-js';
	import { page } from '$app/stores';
	import { cn } from '$lib/utils';
	let formSubmitting = false;

	let callbackUrl = $page.url.searchParams.get('callbackUrl');

	let newFormFlagEnabled = PUBLIC_ENVIRONMENT === 'dev';
	onMount(() => {
		posthog.onFeatureFlags(() => {
			if (posthog.isFeatureEnabled('new-form-validation')) {
				newFormFlagEnabled = true;
			}
		});
	});

	export let data;
	console.log(data.form);
</script>

<div class="w-full h-[100vh] flex flex-col items-center justify-center">
	<div>
		{#if data.orgLogo}
			<img src={data.orgLogo} alt="Organization" width="100" height="100" class="mx-auto" />
		{/if}

		<p class="text-center font-bold text-xl">{data.orgName}</p>
	</div>

	<Card.Root class="w-[350px] relative">
		<div
			class={cn(
				' text-sm bg-secondary rounded-tl-md rounded-br-md font-semibold px-4 py-2 flex items-start w-20 gap-0.5',
				data.orgPlan === 'plus' && 'invisible'
			)}
		>
			<img src="/logo.svg" alt="Logo" class="h-4 w-4" />
			Jonze
		</div>
		<Card.Header>
			<Card.Title class="text-center">Member Onboarding</Card.Title>
		</Card.Header>
		{#if newFormFlagEnabled}
			<div class="p-5">
				<NewForm
					dataForm={data.mergedForm}
					schema={data.zodForm}
					action={'?/newForm'}
					actionName="Sign Up"
				/>
			</div>
		{:else}
			<form
				method="post"
				action={`?/formUpload`}
				use:enhance={() => {
					formSubmitting = true;
					return async ({ result }) => {
						// `result` is an `ActionResult` object
						formSubmitting = false;
						if (result.type === 'redirect') {
							window.location.href = result.location;
						} else {
							await applyAction(result);
						}
					};
				}}
			>
				<Card.Content>
					<div class="grid w-full items-center gap-4 pb-4">
						<div class="flex flex-col space-y-1.5">
							<Label for="firstName">First Name</Label>
							<Input
								id="firstName"
								name="firstName"
								placeholder="First Name"
								required={true}
								value={data.defaultFields.firstName}
							/>
						</div>

						<div class="flex flex-col space-y-1.5">
							<Label for="lastName">Last Name</Label>
							<Input
								id="lastName"
								name="lastName"
								placeholder="Last Name"
								required={true}
								value={data.defaultFields.lastName}
							/>
						</div>
					</div>

					{#if callbackUrl}
						<Input id="callbackUrl" name="callbackUrl" value={callbackUrl} class="hidden" />
					{/if}

					{#if data.form}
						<Preview form={data.form.form} userResponse={undefined} />
					{/if}
				</Card.Content>
				<Card.Footer class="flex justify-end">
					<Button type="submit" disabled={formSubmitting}>
						{#if formSubmitting}
							<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
						{/if}Submit</Button
					>
				</Card.Footer>
			</form>
		{/if}
	</Card.Root>
</div>
