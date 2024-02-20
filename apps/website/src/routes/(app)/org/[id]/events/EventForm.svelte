<script lang="ts">
    import * as Form from "$lib/components/ui/form";
    import { ACCEPTED_IMAGE_TYPES, eventCreationSchema, type EventUpdationSchema, type EventCreationSchema } from "./schema";
    import type { SuperValidated } from "sveltekit-superforms";
    
    export let form: SuperValidated<EventCreationSchema>;
    import { Input } from "$lib/components/ui/input";
    import { client } from "$lib/client/uploadcare";
    import { parseISO, format } from 'date-fns';
    import enUS from 'date-fns/locale/en-US'
    import { formatInTimeZone } from 'date-fns-tz';
	  import type { OrgForm, Event as dbEvent } from "@repo/db/types";
	import { onMount } from "svelte";
	import { browser } from "$app/environment";
    export let event: dbEvent & {form: OrgForm|null}| undefined;
    export let actionType: "create" | "update" = "create";


    function formatToBrowserTimeZone(date: Date) {
      // Format the date and time in the desired format, using the browser's timezone
      const formattedDate = formatInTimeZone(date, Intl.DateTimeFormat().resolvedOptions().timeZone, 'yyyy-MM-dd\'T\'HH:mm');
      console.log(formattedDate);
      return formattedDate;
    }

    $: form.data, console.log(form.data);


    if(browser){
      form.data.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    }



  

	async function handleUpload(e: Event & { currentTarget: EventTarget & HTMLInputElement; }, setValue: (value: unknown) => void): Promise<void> {
    if(!e.currentTarget.files) return
    const file = e.currentTarget.files[0]
    client.uploadFile(file).then((file) => {console.log(file); setValue(file.cdnUrl)})
    console.log(form)
	}
</script>
  

  <Form.Root method="POST" {form} schema={eventCreationSchema} let:config enctype="multipart/form-data" class="p-4" action={actionType === "update" ? "?/update": "?/create"}>
    <Form.Field {config} name="name">
      <Form.Item>
        <Form.Label>Name</Form.Label>
        <Form.Input placeholder="Name of the Event"/>
        <Form.Validation />
      </Form.Item>
    </Form.Field>

    <Form.Field {config} name="description">
        <Form.Item>
            <Form.Label>Description</Form.Label>
            <Form.Textarea
              placeholder="Tell your members a bit more about the event"
            />
            <Form.Validation />
        </Form.Item>
    </Form.Field>



    <div class="grid grid-cols-2 gap-2 w-full">
        <Form.Field {config} name="start">
            <Form.Item class="w-full">
                <Form.Label>Start Time</Form.Label>
                <Form.Input type="datetime-local"/>
                <Form.Validation />
            </Form.Item>
        </Form.Field>
    
        <Form.Field {config} name="end">
            <Form.Item class="w-full">
                <Form.Label>End Time</Form.Label>
                <Form.Input type="datetime-local"/>
                <Form.Validation />
            </Form.Item>
        </Form.Field>
    </div>

    <Form.Field {config} name="timezone">
      <Form.Item class="hidden">
          <Form.Label>User's Timezone</Form.Label>
          <Form.Input type="text" value={"GABAS GBOS"}/>
          <Form.Validation />
      </Form.Item>
  </Form.Field>
    <Form.Field {config} name="image" let:setValue>
      <Form.Item>
        <Form.Label>Image {form.data.image ? "(Image already present)": ""}</Form.Label>
        <Input type="file" on:input={(e) => handleUpload(e, setValue)}/>
        <Form.Input  class="hidden"/>
        <Form.Validation />
      </Form.Item>
    </Form.Field>
    
    
    

    
    <Form.Button>{actionType === "create" ? "Create": "Update"}</Form.Button>
  </Form.Root>