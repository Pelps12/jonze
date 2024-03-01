<script lang="ts">
  import * as Form from "$lib/components/ui/form";
  import { ACCEPTED_IMAGE_TYPES, eventCreationSchema, type EventUpdationSchema, type EventCreationSchema } from "./schema";
  import { type SuperValidated, type Infer, superForm, dateProxy } from "sveltekit-superforms";
  import { Input } from "$lib/components/ui/input";
  import { client } from "$lib/client/uploadcare";
  import { parseISO, format } from 'date-fns';
  import enUS from 'date-fns/locale/en-US'
  import { formatInTimeZone } from 'date-fns-tz';
  import type { OrgForm, Event as dbEvent } from "@repo/db/types";
  import { onMount, tick } from "svelte";
  import { browser } from "$app/environment";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { Textarea } from "$lib/components/ui/textarea";
  import * as Popover from "$lib/components/ui/popover";
  import * as Command from "$lib/components/ui/command";
  import { buttonVariants } from "$lib/components/ui/button";

  import { getAttrs } from "bits-ui";
  import { cn } from "$lib/utils";
  import { Check, ChevronsUpDown } from "lucide-svelte";
  import type { Writable } from "svelte/store";

      
  export let data: SuperValidated<Infer<EventCreationSchema>>;
  export let forms: {id: string; name: string}[] = [];
  export let formOpen: Writable<boolean>;
  export let event: dbEvent & {form: OrgForm|null}| undefined;
  export let actionType: "create" | "update" = "create";


  function formatToBrowserTimeZone(date: Date) {
    // Format the date and time in the desired format, using the browser's timezone
    const formattedDate = formatInTimeZone(date, Intl.DateTimeFormat().resolvedOptions().timeZone, 'yyyy-MM-dd\'T\'HH:mm');
    console.log(formattedDate);
    return formattedDate;
  }

  const form = superForm(data, {
    validators: zodClient(eventCreationSchema),
  });




  

	async function handleUpload(e: Event & { currentTarget: EventTarget & HTMLInputElement; }): Promise<void> {
    if(!e.currentTarget.files) return
    const file = e.currentTarget.files[0]
    client.uploadFile(file).then((file) => {console.log(file); $formData.image = file.cdnUrl})
    console.log(form)
	}

 
  const { form: formData, enhance, constraints } = form;


  let open = false;

  function closeAndFocusTrigger(triggerId: string) {
    open = false;
    tick().then(() => {
      document.getElementById(triggerId)?.focus();
    });
  }
  const startProxy = dateProxy(form, 'start', { format: "datetime-local" });
  const endProxy = dateProxy(form, 'end', {format: "datetime-local"});
</script>
  

  <form method="POST" use:enhance enctype="multipart/form-data" class="p-4" action={actionType === "update" ? "?/update": "?/create"}>
    <Form.Field {form} name="name">
      <Form.Control let:attrs>
        <Form.Label>Name</Form.Label>
        <Input {...attrs} bind:value={$formData.name} placeholder="Name of the Event"/>
        
      </Form.Control>
    </Form.Field>

    <Form.Field {form} name="description">
        <Form.Control let:attrs>
            <Form.Label>Description</Form.Label>
            <Textarea
              {...attrs}
              bind:value={$formData.description}
              placeholder="Tell your members a bit more about the event"
            />
        </Form.Control>
    </Form.Field>



    
        <Form.Field {form} name="start">
            <Form.Control let:attrs >
                <Form.Label>Start Time</Form.Label>
                <Input {...attrs} 
                  type="datetime-local" 
                  bind:value={$startProxy}
                  min={$constraints.start?.min?.toString().slice(0, 16)}/>
            </Form.Control>
        </Form.Field>
    
        <Form.Field {form} name="end">
            <Form.Control let:attrs>
                <Form.Label>End Time</Form.Label>
                <Input {...attrs} 
                  type="datetime-local" 
                  bind:value={$endProxy}
                  min={$constraints.end?.min?.toString().slice(0, 16)}/>
            </Form.Control>
        </Form.Field>

    <Form.Field {form} name="image" class="mb-2">
      <Form.Control let:attrs>
        <Form.Label>Image {$formData.image ? "(Image uploaded)": ""}</Form.Label>
        <Input type="file" on:input={(e) => handleUpload(e)}/>
        <Input  class="hidden" {...attrs} bind:value={$formData.image}/>
      </Form.Control>
    </Form.Field>


      <Form.Field {form} name="formId" class="flex flex-col">
        <Popover.Root bind:open let:ids>
          <Form.Control let:attrs>
            <Form.Label>Form</Form.Label>
            <Popover.Trigger
              class={cn(
                buttonVariants({ variant: "outline" }),
                "w-[200px] justify-between",
                !$formData.formId && "text-muted-foreground"
              )}
              role="combobox"
              {...attrs}
            >
              {forms.find((f) => f.id === $formData.formId)?.name ??
                "Select form"}
              <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Popover.Trigger>
            <input hidden value={$formData.formId} name={attrs.name} />
          </Form.Control>
          <Popover.Content class="w-[200px] p-0">
            <Command.Root>
              <Command.Input
                autofocus
                placeholder="Search form..."
                class="h-9"
              />
              <Command.Empty>No form found.</Command.Empty>
              <Command.Group>
                {#each forms as userForm}
                  <Command.Item
                    value={userForm.id}
                    onSelect={() => {
                      $formData.formId = userForm.id;
                      closeAndFocusTrigger(ids.trigger);
                    }}
                  >
                    {userForm.name}
                    <Check
                      class={cn(
                        "ml-auto h-4 w-4",
                        userForm.id !== $formData.formId && "text-transparent"
                      )}
                    />
                  </Command.Item>
                {/each}
              </Command.Group>
            </Command.Root>
          </Popover.Content>
        </Popover.Root>
      </Form.Field>



    <Form.Button>{actionType === "create" ? "Create": "Update"}</Form.Button>
  </form>