<script>
	import { browser } from "$app/environment";
	import { page } from "$app/stores";


	import Editor from "$lib/components/custom/form/UI/Editor.svelte";
	import { form, form_name } from "$lib/stores/forms";
	import { toast } from "svelte-sonner";
    const formUpload = async () => {
        if(Object.keys($form).length > 0){
            const response = await fetch("/api/forms", {
                method: "POST",
                body: JSON.stringify({
                    organizationId: $page.params.id,
                    form: $form,
                    formName: $form_name
                })
            })

            if(response.ok){
                if(browser){
                    window.history.back();
                }
            }
        }else{
            toast.error("No elements present", {
                description: "You need more than one element to upload",
            })
        }
        
    }
</script>
<Editor initialForm={undefined} onSave={formUpload} initialFormName={undefined}/>