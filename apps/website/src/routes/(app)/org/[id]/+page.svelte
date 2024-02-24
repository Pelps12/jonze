
<script lang="ts">
	import * as Card from "$lib/components/ui/card";
    import * as Avatar from "$lib/components/ui/avatar";

	import type { PageData } from "./$types";
    import * as Resizable from "$lib/components/ui/resizable";
	import { browser } from "$app/environment";


    export let data: PageData;

    export let layout: number[] | undefined = undefined;
	function onLayoutChange(sizes: number[]) {
        if(browser){
            document.cookie = `PaneForge:layout=${JSON.stringify(sizes)}`;
        }	
	}
</script>



    

<Resizable.PaneGroup direction="horizontal" class=" rounded-lg border" {onLayoutChange}>
    <Resizable.Pane defaultSize={layout ? layout[0] : 60} collapsedSize={0} collapsible={true} minSize={50}>
        <Card.Root class=" m-2">
            <Card.Header class="p-4">
                <div class="grid gap-4">
                <Card.Title class="text-lg font-semibold">Event Metrics</Card.Title>
                </div>
            </Card.Header>
            <Card.Content class="grid gap-4">
                <div class="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
                    <div class="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
    
                
                        <h3 class="mt-4 text-lg font-semibold">Coming soon</h3>
                        <p class="mb-4 mt-2 text-sm text-muted-foreground">
                            Event analytics are currently unavailable but are in the works
                        </p>
    
                    </div>
                </div>
    
            </Card.Content>
        </Card.Root>
    </Resizable.Pane>
    <Resizable.Handle withHandle />
    <Resizable.Pane defaultSize={layout ? layout[0] : 40} minSize={25} collapsedSize={0}>
        <Card.Root class=" m-2 h-auto">
            <Card.Header class="p-4">
                <div class="grid gap-4">
                <Card.Title class="text-lg font-semibold">Recent Members</Card.Title>
                <Card.Description class="text-sm">Recent additions to your org</Card.Description>
                </div>
            </Card.Header>
            <Card.Content class="grid gap-4">
                {#each data.organization.members as member}
                    <div class="relative flex items-start space-x-4 ">
                        <Avatar.Root class="w-10 h-10 border">
                            <Avatar.Image src={member.user.profilePictureUrl} />
                            <Avatar.Fallback>{(member.user.firstName?.charAt(0) ?? "U") + (member.user.lastName?.charAt(0) ?? "")}</Avatar.Fallback>
                        </Avatar.Root>
                        <div class="text-sm grid gap-1">
                            <Card.Title class="text-base font-semibold">
                                {((member.user.firstName ?? "No")+ " " + (member.user.lastName ?? "Name"))}
                            </Card.Title>
                            <Card.Description class="text-sm">
                                {member.user.email}
                            </Card.Description>
                        </div>
    
                        <div class="ml-auto absolute right-0 text-sm self-center">
                            {member.createdAt.toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                })}
                        </div>
                    </div>
                {/each}
            </Card.Content>
        </Card.Root>
    </Resizable.Pane>
</Resizable.PaneGroup>




<style>
    .chart {
        width: 100%;
        margin: 0 auto;
    }

    svg {
        position: relative;
        width: 100%;
        height: 350px;
    }

    rect {
        max-width: 51px;
    }
</style>

