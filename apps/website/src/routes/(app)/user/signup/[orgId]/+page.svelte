<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Form from '$lib/components/ui/form';
	import { formSchema, type FormSchema } from '../schema';
	import type { ActionData } from './$types';
	import Preview from '$lib/components/custom/form/UI/Preview.svelte';
	import { page } from '$app/stores';
	export let data;
	console.log(data.form);
</script>

<div class="w-full h-[100vh] flex items-center justify-center">
	<Card.Root class="w-[350px]">
		<form method="post">
			<Card.Header>
				<Card.Title>{'Member Onboarding'}</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="grid w-full items-center gap-4 pb-4">
					<div class="flex flex-col space-y-1.5">
						<Label for="firstName">First Name</Label>
						<Input
							id="firstName"
							name="firstName"
							placeholder="First Name"
							value={data.defaultFields.firstName}
						/>
					</div>

					<div class="flex flex-col space-y-1.5">
						<Label for="lastName">Last Name</Label>
						<Input
							id="lastName"
							name="lastName"
							placeholder="First Name"
							value={data.defaultFields.lastName}
						/>
					</div>
				</div>
				{#if data.form}
					<Preview form={data.form.form} userResponse={undefined} />
				{/if}
			</Card.Content>
			<Card.Footer class="flex justify-end">
				<Button type="submit">Submit</Button>
			</Card.Footer>
		</form>
	</Card.Root>
</div>
