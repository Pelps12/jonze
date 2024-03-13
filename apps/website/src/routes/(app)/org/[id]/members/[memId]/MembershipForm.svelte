<script lang="ts">
    import * as Form from "$lib/components/ui/form";
    import {type MembershipCreationSchema, membershipCreationSchema } from "./schema";
    import { type SuperValidated, type Infer, superForm, dateProxy } from "sveltekit-superforms";
    import { Input } from "$lib/components/ui/input";
    import { client } from "$lib/client/uploadcare";
    import type { OrgForm, Event as dbEvent } from "@repo/db/types";
    import { onMount, tick } from "svelte";
    import { zodClient } from "sveltekit-superforms/adapters";
    import { Textarea } from "$lib/components/ui/textarea";
    import * as Popover from "$lib/components/ui/popover";
    import * as Command from "$lib/components/ui/command";
    import { buttonVariants } from "$lib/components/ui/button";
    import { cn } from "$lib/utils";
    import { Check, ChevronsUpDown } from "lucide-svelte";
    import type { Writable } from "svelte/store";
	import { providerEnum } from "@repo/db/schema/membership";
  
        
    export let data: SuperValidated<Infer<MembershipCreationSchema>>;
    export let plans: {id: string; name: string}[] = [];

  
    const form = superForm(data, {
      validators: zodClient(membershipCreationSchema),
    });
  
  
    
  
    
  

    onMount(() => {
        console.log("MEN MOUNT");

    });
  
   
    const { form: formData, enhance, constraints } = form;
  
    let open = {
        plan: false,
        provider: false
    } 
    function closeAndFocusTrigger(triggerId: string, field: "plan" | "provider") {
      open[field] = false;
      tick().then(() => {
        document.getElementById(triggerId)?.focus();
      });
    }
    const createdAtProxy = dateProxy(form, 'createdAt', { format: "datetime-local" });

  </script>

<form method="POST" use:enhance enctype="multipart/form-data" class="p-4" action="?/updatemembership">
    <Form.Field {form} name="planId" class="flex flex-col mb-3">
        <Popover.Root bind:open={open["plan"]} let:ids>
          <Form.Control let:attrs>
            <Form.Label>Plan</Form.Label>
            <Popover.Trigger
              class={cn(
                buttonVariants({ variant: "outline" }),
                "w-[200px] justify-between",
                !$formData.planId && "text-muted-foreground"
              )}
              role="combobox"
              {...attrs}
            >
              {plans.find((f) => f.id === $formData.planId)?.name ??
                "Select form"}
              <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Popover.Trigger>
            <input hidden value={$formData.planId} name={attrs.name} />
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
                {#each plans as plan}
                  <Command.Item
                    value={plan.id}
                    onSelect={() => {
                      $formData.planId = plan.id;
                      closeAndFocusTrigger(ids.trigger, "plan");
                    }}
                  >
                    {plan.name}
                    <Check
                      class={cn(
                        "ml-auto h-4 w-4",
                        plan.id !== $formData.planId && "text-transparent"
                      )}
                    />
                  </Command.Item>
                {/each}
              </Command.Group>
            </Command.Root>
          </Popover.Content>
        </Popover.Root>
      </Form.Field>
    
      <Form.Field {form} name="provider" class="flex flex-col my-3">
        <Popover.Root bind:open={open["provider"]} let:ids>
          <Form.Control let:attrs>
            <Form.Label>Provider</Form.Label>
            <Popover.Trigger
              class={cn(
                buttonVariants({ variant: "outline" }),
                "w-[200px] justify-between",
                !$formData.provider && "text-muted-foreground"
              )}
              role="combobox"
              {...attrs}
            >
              {providerEnum.enumValues.find((f) => f === $formData.provider) ??
                "Select form"}
              <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Popover.Trigger>
            <input hidden value={$formData.provider} name={attrs.name} />
          </Form.Control>
          <Popover.Content class="w-[200px] p-0">
            <Command.Root>
              <Command.Input
                autofocus
                placeholder="Search provider..."
                class="h-9"
              />
              <Command.Group>
                {#each providerEnum.enumValues as provider}
                  <Command.Item
                    value={provider}
                    onSelect={() => {
                      $formData.provider = provider;
                      closeAndFocusTrigger(ids.trigger, "provider");
                    }}
                  >
                    {provider}
                    <Check
                      class={cn(
                        "ml-auto h-4 w-4",
                        provider !== $formData.provider && "text-transparent"
                      )}
                    />
                  </Command.Item>
                {/each}
              </Command.Group>
            </Command.Root>
          </Popover.Content>
        </Popover.Root>
    </Form.Field>

    <Form.Field {form} name="createdAt" class="my-3">
        <Form.Control let:attrs >
            <Form.Label>Joined At (Optional)</Form.Label>
            <Input {...attrs} 
              type="datetime-local" 
              bind:value={$createdAtProxy}
              min={$constraints.createdAt?.min?.toString().slice(0, 16)}/>
        </Form.Control>
    </Form.Field>

    <Form.Button>Change</Form.Button>
</form>
    

