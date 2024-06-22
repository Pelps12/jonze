<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { type MemberUpdationSchema, memberUpdationSchema } from './schema';
	import { type SuperValidated, type Infer, superForm, dateProxy } from 'sveltekit-superforms';
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
	import { Check, ChevronsUpDown, LoaderCircle } from 'lucide-svelte';
	import type { Writable } from 'svelte/store';
	import { providerEnum } from '@repo/db/schema/membership';
	import { MultiSelect } from 'svelte-multiselect';
	import { badgeVariants } from '$lib/components/ui/badge';

	export let data: SuperValidated<Infer<MemberUpdationSchema>>;

	export let closeForm: () => void;

	const form = superForm(data, {
		validators: zodClient(memberUpdationSchema),
		dataType: 'json',
		onResult: () => {
			closeForm();
		}
	});

	onMount(() => {
		console.log('MEN MOUNT');
	});

	const { form: formData, enhance, submitting } = form;

	const default_tags = ['#paid', '#admin', '#family-leader'];
</script>

<form method="POST" use:enhance enctype="multipart/form-data" class="p-4" action="?/updatemember">
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

	<Form.Button disabled={$submitting}>
		{#if $submitting}
			<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
		{/if}

		{$submitting ? 'Updating' : 'Update'}
	</Form.Button>
</form>
