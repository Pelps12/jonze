<script lang="ts">
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { onMount } from "svelte";
	import {edit, deleteElement, form } from "$lib/stores/forms";
	import FieldWrapper from "./FieldWrapper.svelte";
	import type { CustomTextField } from "$lib/types/forms";
    export let key: string;
    export let data: CustomTextField
    $: temporaryEdit = structuredClone(data);
    const handleChange = (value: Partial<CustomTextField>) => {
        temporaryEdit = { ...temporaryEdit, ...value }; 
	};
    onMount(() => {
        console.log(temporaryEdit, key)
    })

	const handleSave = () => {
        console.log("HIGH")
		edit(key, temporaryEdit);
	};


	const handleDelete = () => {
		deleteElement(key);
	};
</script> 

<FieldWrapper handleDelete={handleDelete} handleSave={handleSave}>
    <div class="flex flex-col gap-2">
        <div class="flex flex-col space-y-1.5 ">
        
            <Input id="name" placeholder="Label" value={temporaryEdit.label} on:input={(e) =>
                handleChange({
                    label: e.target.value
                })
            }/>
          </div>      
          
          <div class="flex flex-col space-y-1.5">
            
            <Input id="name" placeholder="Placeholder" value={temporaryEdit.placeholder} on:input={(e) =>
                handleChange({
                    placeholder: e.target.value
                })
            }/>
          </div>
    </div>
        
</FieldWrapper>