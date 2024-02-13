<script lang="ts">
    import * as Form from "$lib/components/ui/form";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import * as Select from "$lib/components/ui/select";
	import { Textarea } from "$lib/components/ui/textarea";
	import type { CustomForm } from "$lib/types/forms";
    import type { SuperValidated } from "sveltekit-superforms";
    export let form: CustomForm;
    export let userResponse: Record<string, string>|undefined;
    $: userResponse, console.log(userResponse);

    $: response = Object.keys(form).reduce<Record<string, string>>((accumulator, currentKey) => {
        if(userResponse){
            accumulator[currentKey] = userResponse[currentKey]; // Set each key's value to an empty string
            
        }
        return accumulator;    
    }, {});
    ;
  </script>

    <div class="grid w-full items-center gap-4">
        {#each Object.keys(form) as key}
            <div class="flex flex-col space-y-1.5">
                {#if form[key].type === "text"}
                    <Label for={key}>{form[key].label}</Label>
                    <Input id={key} placeholder={form[key].placeholder} name={key} value={response[key]}/>
                {:else if form[key].type === "textarea"}
                    <Label for={key}>{form[key].label}</Label>
                    <Textarea id={key} placeholder={form[key].placeholder} name={key} value={response[key]}/>
                {:else if form[key].type === "dropdown"}
                    <Label for="framework">{form[key].label}</Label>
                    <Select.Root name={key} selected={response[key]}>
                        <Select.Trigger id={key}>
                            <Select.Value placeholder="Select" />
                        </Select.Trigger>
                        <Select.Content>
                            {#each form[key].options as option}
                            <Select.Item value={option.label} label={option.label}
                                >{option.label}</Select.Item
                            >
                            {/each}
                        </Select.Content>
                    </Select.Root>
                {/if}
                
            </div>
        {/each}
      
    </div>
