<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
    import * as Dialog from "$lib/components/ui/dialog";
    import * as Drawer from "$lib/components/ui/drawer";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { mediaQuery } from "svelte-legos";
	import EventForm from "./EventForm.svelte";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import { Copy, MoreHorizontal } from "lucide-svelte";
    import {browser} from "$app/environment"
    import {PUBLIC_URL} from "$env/static/public"
	import { toast } from "svelte-sonner";
	import Preview from "$lib/components/custom/form/UI/Preview.svelte";
    let newFormOpen = false;
    let editFormOpen = false;
    const isDesktop = mediaQuery("(min-width: 768px)");
    const handleCopyAttendance = (eventId: string) => {
        if(browser){
            navigator.clipboard.writeText(`${PUBLIC_URL}/event/attendance/${eventId}`).then(() => {
                toast.success("Attendance Link added to Clipboard")
            })
        }
    }


  export let data;




</script>
<div class="flex justify-between items-center mb-6">
    <h2 class="text-xl font-semibold">Events</h2>
    <div class="flex space-x-2">
        {#if $isDesktop}
            <Dialog.Root bind:open={newFormOpen} >
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
                    <EventForm form={data.form} event={undefined}/>
                </Dialog.Content>
            </Dialog.Root>
        {:else}
            <Drawer.Root bind:open={newFormOpen}>
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
                    <EventForm form={data.form} event={undefined}/>
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
                <Card.Title class="flex justify-between">
                    <p>{event.name}</p>
                    <Dialog.Root>
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild let:builder>
                                <Button
                                    variant="ghost"
                                    builders={[builder]}
                                    class="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                                >
                                    <MoreHorizontal class="h-4 w-4" />
                                    <span class="sr-only">Open menu</span>
                                </Button>
                            </DropdownMenu.Trigger>

                            <DropdownMenu.Content class="w-[200px]" align="end">
                                <DropdownMenu.Item on:click={() => handleCopyAttendance(event.id)}>
                                    <span>Attendance Link</span> 
                                    <Copy class="ml-2 h-4 w-4"/> 
                                </DropdownMenu.Item>
                                {#if event.form}
                                    <DropdownMenu.Item>
                                        <Dialog.Trigger>
                                            Event Form
                                        </Dialog.Trigger>
                                    </DropdownMenu.Item>
                                {/if}
                                <DropdownMenu.Item href={`events/${event.id}`}>View Attendance</DropdownMenu.Item>
                            </DropdownMenu.Content>

                            {#if event.form}
                                <Dialog.Content class="sm:max-w-[425px]">
                                    <Dialog.Header>
                                        <Dialog.Title>{event.form.name}</Dialog.Title>
                                        <Dialog.Description>
                                            Form attached to event attendance
                                        </Dialog.Description>
                                    </Dialog.Header>

                                    <Preview form={event.form.form} userResponse={undefined}/>
                                    
                                </Dialog.Content>
                            {/if}
                    
                            
                        </DropdownMenu.Root>
                    </Dialog.Root>
                </Card.Title>
                <Card.Description>{new Date(event.start).toLocaleDateString('en-US', {
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
                    placeholder={"/placeholder.svg"}
                    width={350}
                    />
                </div>
                <Card.Content>
                <p class="text-sm text-gray-600">
                    {event.description}
                </p>
                </Card.Content>
                <Card.Footer class="flex justify-between">
                    {#if $isDesktop}
                        <Dialog.Root bind:open={editFormOpen} >
                            <Dialog.Trigger asChild let:builder>
                            <Button variant="outline" builders={[builder]}>Edit</Button>
                            </Dialog.Trigger>
                            <Dialog.Content class="sm:max-w-[425px]">
                            <Dialog.Header>
                                <Dialog.Title>Update your Event</Dialog.Title>
                                <Dialog.Description>
                                    Allow members mark attendance on your events
                                </Dialog.Description>
                            </Dialog.Header>
                                <EventForm form={data.updateForm} event={event} actionType="update"/>
                            </Dialog.Content>
                        </Dialog.Root>
                    {:else}
                        <Drawer.Root bind:open={editFormOpen}>
                            <Drawer.Trigger asChild let:builder>
                            <Button variant="outline" builders={[builder]}>Edit</Button>
                            </Drawer.Trigger>
                            <Drawer.Content class="p-4">
                            <Drawer.Header class="text-left">
                                <Drawer.Title>Update your Event</Drawer.Title>
                                <Drawer.Description>
                                    Allow members mark attendance on your events
                                </Drawer.Description>
                            </Drawer.Header>
                                <EventForm form={data.updateForm} event={event} actionType="update"/>
                            <Drawer.Footer class="pt-2">
                                <Drawer.Close asChild let:builder>
                                <Button variant="outline" builders={[builder]}>Cancel</Button>
                                </Drawer.Close>
                            </Drawer.Footer>
                            </Drawer.Content>
                        </Drawer.Root>
                    {/if}
                    <Button variant="destructive">Delete</Button>
                </Card.Footer>
            </Card.Root>
        {/each}

    </div>
  </div>