<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import * as Sheet from "$lib/components/ui/sheet";
	import { FileText, PlusCircle, Save, ScanEye } from "lucide-svelte";
	import { form, add, form_name } from "$lib/stores/forms";
	import FieldWrapper from "$lib/components/custom/form/UI/FieldWrapper.svelte";
	import TextView from "$lib/components/custom/form/UI/TextView.svelte";
	import DropDownView from "$lib/components/custom/form/UI/DropDownView.svelte";
    import TextAreaView from "$lib/components/custom/form/UI/TextAreaView.svelte";
	import { page } from "$app/stores";
	import type { CustomField, CustomForm } from "$lib/types/forms";
    import { toast } from "svelte-sonner";
	import { browser } from "$app/environment";
	import { onMount } from "svelte";
	import { Label } from "$lib/components/ui/label";
	import { Input } from "$lib/components/ui/input";
	import * as Drawer from "$lib/components/ui/drawer";
    import * as Dialog from "$lib/components/ui/dialog";
	import { mediaQuery } from "svelte-legos";
	import Preview from "./Preview.svelte";
    let open = $page.url.searchParams.has("preview");
    const isDesktop = mediaQuery("(min-width: 768px)");
    export let onSave: () => Promise<void>;

    export let initialForm: CustomForm|undefined;
    export let initialFormName: string| undefined;

    
    


    onMount(() => {
        if(initialForm && initialFormName){
            form.set(initialForm)
            form_name.set(initialFormName)
        }

        return (() => {
            form.set({})
        })
    })
  
    const addHelper = (type: CustomField["type"]) => {
        switch (type){
            case "text":
                add({
                    label: 'Label',
                    type: 'text',
                    placeholder: 'Placeholder'
                });
            break;
            case "textarea":
                add({
                    label: 'Label',
                    type: 'textarea',
                    placeholder: 'Placeholder'
                });
            break;
            case "radio":
                add({
                    label: 'Label',
                    type: 'radio',
                    options: [
                        {
                            label: 'Option 1'
                        }
                    ]
                });
            break;
            case "dropdown":
                add({
                    label: 'Label',
                    type: 'dropdown',
                    options: [
                        {
                            label: 'Item 1'
                        }
                    ]
                });
            break;
        }
    }
  </script>
  <div class="h-auto w-full flex items-center justify-center relative">
    <div class="flex absolute top-0 right-0 gap-4">
        
            
            <Sheet.Root>
                <Sheet.Trigger asChild let:builder>
                    <Button builders={[builder]} variant="secondary" >
                        <PlusCircle class="h-4 w-4 lg:mr-2"/> 
                        <span class="hidden lg:block">Add Field</span> 
                    </Button>
                </Sheet.Trigger>
                <Sheet.Content side="left">
                  <Sheet.Header>
                    <Sheet.Title>Add Field</Sheet.Title>
                    <Sheet.Description>
                      Add field to form for user response
                    </Sheet.Description>
                  </Sheet.Header>
                  <div class="flex flex-col gap-2">
                        <Button variant="secondary" on:click={() => addHelper("text")}>
                            <PlusCircle class="h-4 w-4 mr-2"/> 
                            <span>Text Field</span> 
                        </Button>

                        <Button variant="secondary" on:click={() => addHelper("textarea")}>
                            <PlusCircle class="h-4 w-4 mr-2"/> 
                            <span>TextArea Field</span> 
                        </Button>

                        <Button variant="secondary" on:click={() => addHelper("radio")}>
                            <PlusCircle class="h-4 w-4 mr-2"/> 
                            <span>Options Field</span> 
                        </Button>

                        <Button variant="secondary" on:click={() => addHelper("dropdown")}>
                            <PlusCircle class="h-4 w-4 mr-2"/> 
                            <span>Dropdown Field</span> 
                        </Button>
                    </div>

                </Sheet.Content>
              </Sheet.Root>
              {#if $isDesktop}
                <Dialog.Root bind:open>
                    <Dialog.Trigger asChild let:builder>
                        <Button builders={[builder]} variant="secondary">
                            <ScanEye class="w-4 h-4 lg:mr-2"/>
                            <span class="hidden lg:block">Preview</span> 
                        </Button>
                    </Dialog.Trigger>
                    <Dialog.Content class="sm:max-w-[425px]">
                    <Dialog.Header>
                        <Dialog.Title>Form Preview</Dialog.Title>
                        <Dialog.Description>
                        This is how you for will look to users
                        </Dialog.Description>
                    </Dialog.Header>
                    <Preview form={$form} userResponse={undefined}/>
                    </Dialog.Content>
                </Dialog.Root>
            {:else}
              <Drawer.Root bind:open>
                <Drawer.Trigger asChild let:builder>
                    <Button builders={[builder]} variant="secondary">
                        <ScanEye class="w-4 h-4 lg:mr-2"/>
                        <span class="hidden lg:block">Preview</span> 
                    </Button>
                </Drawer.Trigger>
                <Drawer.Content class="p-4">
                  <Drawer.Header class="text-left">
                    <Drawer.Title>Form Preview</Drawer.Title>
                    <Drawer.Description>
                      This is how you for will look to users
                    </Drawer.Description>
                  </Drawer.Header>
                  <Preview form={$form} userResponse={undefined}/>
                  <Drawer.Footer class="pt-2">
                    <Drawer.Close asChild let:builder>
                      <Button variant="outline" builders={[builder]}>Cancel</Button>
                    </Drawer.Close>
                  </Drawer.Footer>
                </Drawer.Content>
              </Drawer.Root>
            {/if}



              <Button  on:click={() => onSave()}>
                <Save class="w-4 h-4 lg:mr-2" />
                <span class="hidden lg:block">Save Changes</span> 
            </Button>
        
    </div>
    {#if Object.keys($form).length > 0}
        <Card.Root class="w-[350px] p-3">
            <Card.Header>
                <Card.Title>
                    <div class="flex flex-col space-y-1.5">
                        
                        <Input id="name" placeholder="Form Name" bind:value={$form_name}/>
                      </div>
                </Card.Title>
            </Card.Header>
            <Card.Content>
                <div class="flex flex-col gap-3">
                        {#each Object.keys($form) as key}
                            {#if $form[key]}
                                {#if $form[key]?.type === "text"}
                                    <TextView data={$form[key]} key={key}/>
                                {:else if $form[key]?.type === "textarea"}
                                    <TextAreaView data={$form[key]} key={key}/>
                                {:else}
                                    <DropDownView data={$form[key]} key={key}/>
                                {/if}
                            {/if}  
                        {/each}
                </div> 
            </Card.Content>
        </Card.Root>
    {:else}
        <div class="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
            <div class="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center p-2">
                <FileText class="h-10 w-10"/>
        
                <h3 class="mt-4 text-lg font-semibold">No form fields added</h3>
                <p class="mb-4 mt-2 text-sm text-muted-foreground">
                    You have not added any fields to this form
                </p>

            </div>
        </div>
    {/if}
    
  </div>
