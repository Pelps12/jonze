<script lang="ts">
    import * as Form from "$lib/components/ui/form";
    import { ACCEPTED_IMAGE_TYPES, eventCreationSchema, type EventCreationSchema } from "./schema";
    import type { SuperValidated } from "sveltekit-superforms";
    
    export let form: SuperValidated<EventCreationSchema>;
    import * as LR from "@uploadcare/blocks";
    import blocksStyles from '@uploadcare/blocks/web/lr-file-uploader-minimal.min.css?url';
    LR.registerBlocks(LR);
  
    const frameworks = [
      {
        value: "sveltekit",
        label: "SvelteKit"
      },
      {
        value: "next",
        label: "Next.js"
      },
      {
        value: "astro",
        label: "Astro"
      },
      {
        value: "nuxt",
        label: "Nuxt.js"
      }
    ];
  </script>
  

  <Form.Root method="POST" {form} schema={eventCreationSchema} let:config enctype="multipart/form-data" class="p-4">
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
    <Form.Field {config} name="image" >
        <Form.Item class="w-full">
            <Form.Label>Image</Form.Label>
            <Form.Input type="file" accept={ACCEPTED_IMAGE_TYPES.join(", ")} />
            <Form.Description>This could be your Instagram poster</Form.Description>
            <Form.Validation />
        </Form.Item>
    </Form.Field>
    
    
    

    
    <Form.Button>Submit</Form.Button>
  </Form.Root>