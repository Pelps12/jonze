<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { trpc } from '$lib/client/trpc';

	import Editor from '$lib/components/custom/form/UI/Editor.svelte';
	import Alert from '$lib/components/ui/alert/alert.svelte';
	import { form, form_name } from '$lib/stores/forms';
	import { TRPCError } from '@trpc/server';
	import { toast } from 'svelte-sonner';

	const formQuery = trpc().formRouter.getForm.createQuery({
		orgId: $page.params.id,
		formId: $page.params.formId
	});

	const uploadMutation = trpc().formRouter.updateForm.createMutation();
	const utils = trpc().createUtils();

	const formUpload = async () => {
		if (Object.keys($form).length > 0 && $form_name) {
			try {
				await $uploadMutation.mutateAsync({
					orgId: $page.params.id,
					form: $form,
					formName: $form_name,
					formId: $page.params.formId
				});
				await utils.formRouter.getForms.invalidate();
				if (browser) {
					window.history.back();
				}
			} catch (err: any) {
				if (err instanceof TRPCError) {
					toast.error(err.message);
				} else {
					toast.error(err?.message as any);
				}
			}
		} else {
			toast.error('No elements present', {
				description: 'You need more than one element to upload'
			});
		}
	};
</script>

{#if $formQuery.data}
	<Editor
		initialForm={$formQuery.data.form.form}
		onSave={formUpload}
		initialFormName={$formQuery.data.form.name}
	/>
{/if}
