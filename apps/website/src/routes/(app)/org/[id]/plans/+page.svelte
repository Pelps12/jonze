<script lang="ts">

	import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card"
    import * as Drawer from "$lib/components/ui/drawer"
    import * as Dialog from "$lib/components/ui/dialog"
	import { mediaQuery } from "svelte-legos";
	import { writable } from "svelte/store";
    import PlanForm  from "./PlanForm.svelte"
    let newFormOpen = writable(false);

    export let data;

    const isDesktop = mediaQuery("(min-width: 768px)");

</script>
<div class="flex justify-between items-center mb-6">
    <h2 class="text-xl font-semibold">Membership Plans</h2>
    <div class="flex space-x-2">
        {#if $isDesktop}
        <Dialog.Root bind:open={$newFormOpen} >
            <Dialog.Trigger asChild let:builder>
            <Button variant="outline" builders={[builder]}>Add Plan</Button>
            </Dialog.Trigger>
            <Dialog.Content class="sm:max-w-[425px]">
            <Dialog.Header>
                <Dialog.Title>Create your Event</Dialog.Title>
                <Dialog.Description>
                    Allow members mark attendance on your events
                </Dialog.Description>
            </Dialog.Header>
                <PlanForm data={data.form}/>
            </Dialog.Content>
        </Dialog.Root>
    {:else}
        <Drawer.Root bind:open={$newFormOpen}>
            <Drawer.Trigger asChild let:builder>
            <Button variant="outline" builders={[builder]}>Add Plan</Button>
            </Drawer.Trigger>
            <Drawer.Content class="p-4">
            <Drawer.Header class="text-left">
                <Drawer.Title>Create your Event</Drawer.Title>
                <Drawer.Description>
                    Allow members mark attendance on your events
                </Drawer.Description>
            </Drawer.Header>
                <PlanForm data={data.form}/>
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

<div class=" rounded-lg p-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each data.plans as plan}
            <Card.Root class="max-w-xs">
                <Card.Header>
                <Card.Title class="flex justify-between">
                    <p>{plan.name}</p>
                </Card.Title>
                {#if plan.start}
                    <Card.Description>Resets: {new Date(plan.start).toLocaleDateString('en-US', {
                            month: 'long', 
                            day: 'numeric'   
                        })
                    }
                    </Card.Description>
                {/if}

                </Card.Header>
               
                <Card.Content>
                    <h1 class="text-xl font-semibold">
                        ${plan.amount}
                    </h1>
                <p class="text-sm ">
                    {plan.interval.years} year(s)
                </p>
                </Card.Content>

            </Card.Root>
        {/each}

    </div>
  </div>