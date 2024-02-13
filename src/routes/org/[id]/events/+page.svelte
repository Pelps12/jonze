<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
    import * as Dialog from "$lib/components/ui/dialog";
    import * as Drawer from "$lib/components/ui/drawer";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { mediaQuery } from "svelte-legos";
	import NewEventForm from "./NewEventForm.svelte";
  let open = false;
  const isDesktop = mediaQuery("(min-width: 768px)");

  export let data;


</script>
<div class="flex justify-between items-center mb-6">
    <h2 class="text-xl font-semibold">Events</h2>
    <div class="flex space-x-2">
        {#if $isDesktop}
            <Dialog.Root bind:open>
                <Dialog.Trigger asChild let:builder>
                <Button variant="outline" builders={[builder]}>Add Event</Button>
                </Dialog.Trigger>
                <Dialog.Content class="sm:max-w-[425px]">
                <Dialog.Header>
                    <Dialog.Title>Create your Event</Dialog.Title>
                    <Dialog.Description>
                        Allow members mark attendance on your events
                    </Dialog.Description>
                </Dialog.Header>
                    <NewEventForm form={data.form}/>
                </Dialog.Content>
            </Dialog.Root>
        {:else}
            <Drawer.Root bind:open>
                <Drawer.Trigger asChild let:builder>
                <Button variant="outline" builders={[builder]}>Add Event</Button>
                </Drawer.Trigger>
                <Drawer.Content class="p-4">
                <Drawer.Header class="text-left">
                    <Drawer.Title>Create your Event</Drawer.Title>
                    <Drawer.Description>
                        Allow members mark attendance on your events
                    </Drawer.Description>
                </Drawer.Header>
                    <NewEventForm form={data.form}/>
                <Drawer.Footer class="pt-2">
                    <Drawer.Close asChild let:builder>
                    <Button variant="outline" builders={[builder]}>Cancel</Button>
                    </Drawer.Close>
                </Drawer.Footer>
                </Drawer.Content>
            </Drawer.Root>
        {/if}
    </div>
  </div>
  <div class=" shadow rounded-lg p-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each data.events as event}
            <Card.Root class="w-full">
                <Card.Header>
                <Card.Title>{event.name}</Card.Title>
                <Card.Description>{new Date(event.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric'   
                  })
                  }</Card.Description>
                </Card.Header>
                <div class="flex justify-center rounded-lg m-3">
                    <img
                    alt="Spring Festival"
                    class=" aspect-square object-cover m-5 w-auto rounded-lg "
                    height={350}
                    src={event.image}
        
                    width={350}
                    />
                </div>
                <Card.Content>
                <p class="text-sm text-gray-600">
                    {event.description}
                </p>
                </Card.Content>
                <Card.Footer class="flex justify-between">
                <Button variant="ghost">Edit</Button>
                <Button variant="destructive">Delete</Button>
                </Card.Footer>
            </Card.Root>
        {/each}

    </div>
  </div>