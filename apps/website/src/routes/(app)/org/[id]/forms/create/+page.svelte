<script>
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { trpc } from '$lib/client/trpc';

	import Editor from '$lib/components/custom/form/UI/Editor.svelte';
	import { form, form_name } from '$lib/stores/forms';
	import { TRPCError } from '@trpc/server';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	const initialFormName = $page.url.searchParams.get('form_name');

	onMount(() => {
		console.log(initialFormName);
	});

	const uploadMutation = trpc().formRouter.createForm.createMutation();
	const utils = trpc().createUtils();
	const formUpload = async () => {
		if (Object.keys($form).length > 0 && $form_name) {
			try {
				await $uploadMutation.mutateAsync({
					orgId: $page.params.id,
					form: $form,
					formName: $form_name
				});
				await utils.formRouter.getForms.invalidate();
				if (browser) {
					window.history.back();
				}
			} catch (err) {
				if (err instanceof TRPCError) {
					toast.error(err.message);
				} else {
					toast.error('Unknown Error Occured');
				}
			}
		} else {
			if (!$form_name) {
				toast.error('Please add a form name');
			} else {
				toast.error('No elements present', {
					description: 'You need more than one element to upload'
				});
			}
		}
	};
</script>

<Editor
	initialForm={undefined}
	onSave={formUpload}
	initialFormName={initialFormName ?? undefined}
/>
