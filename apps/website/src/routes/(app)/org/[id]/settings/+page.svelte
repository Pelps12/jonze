<script lang="ts">

	import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
	import { CopyIcon, PlusCircle, TrashIcon } from "lucide-svelte";
    import {enhance} from "$app/forms"
	import { page } from "$app/stores";
    import * as Dialog from "$lib/components/ui/alert-dialog";
	import { Input } from "$lib/components/ui/input";
	import { browser } from "$app/environment";
	import { toast } from "svelte-sonner";
    import * as Avatar from "$lib/components/ui/avatar";
	import { invalidate } from "$app/navigation";
	import { PUBLIC_APIKEY_PREFIX } from "$env/static/public";

    page.subscribe((info) => console.log(info.form));
    let open = true;

    const handleCopyKey = (key: string) => {
        if(browser){
            navigator.clipboard.writeText(key).then(() => {
                toast.success("API Key Copied to Clipboard")
            })
        }
    }

    const handleDeleteKey = async (keyId: string) => {
        const response = await fetch("/api/keys", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                keyId
            })
        })
        if(response.ok){
            invalidate((url) => {
                console.log(url.pathname, $page.url.pathname)
                return url.pathname === $page.url.pathname
            })
        }
    }
    export let data;
    console.log(data)

</script>
<div class="flex justify-start items-center mb-6">
    <h2 class="text-xl font-semibold">Settings</h2>
</div>
<div class="p-6 grid grid-cols-1  gap-4">
    <form method="post" action="?/create" use:enhance={() => {
    
        return async ({ result, update }) => {
            if(result.type === "success"){
                if(typeof result.data?.key === "string"){
                    open = true;
                }
            }
            update()
        };
    }}>
        <Card.Root class="w-[500px]  m-2">
            <Card.Header class="p-4">
            <div class="flex justify-between">
                <Card.Title class="text-lg font-semibold">API Key</Card.Title>

                {#if data.keys.length > 0}
                    <Button type = "submit">
                        <PlusCircle class="mr-2 h-4 w-4"/>
                        <span>Create API Key</span>
                    </Button>
                {/if}
            </div>
            </Card.Header>
            
                <Card.Content class="grid gap-4">
                    {#if data.keys.length === 0}
                        <div class="flex h-[250px] shrink-0 items-center justify-center rounded-md border border-dashed">
                            <div class="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                                <h3 class="mt-4 text-lg font-semibold">No API Key Made</h3>
                                <p class="mb-4 mt-2 text-sm text-muted-foreground">
                                    You can use API keys to connect Jonze to your website
                                </p>
                                <Button type="submit">
                                    <PlusCircle class="mr-2 h-4 w-4"/>
                                    <span>Create API Key</span>
                                </Button>
                            </div>
                        </div>
                    {:else}
                        {#each data.keys as key}
                            <div class="flex w-full max-w-sm items-center space-x-2">
                                <Input id="name" value={`${PUBLIC_APIKEY_PREFIX}_${key.hint}********************`} class="col-span-3" readonly/>
                                <Button class="w-auto" variant="destructive" on:click={() => handleDeleteKey(key.keyId)}>
                                    <TrashIcon class="h-4 w-4 p-0"/>
                                </Button>
                            </div>
                        {/each}
                    {/if}

                    

                </Card.Content>
            
        </Card.Root>
    </form>

     {#if typeof $page.form?.key === "string"}
        <Dialog.Root bind:open closeOnOutsideClick={false}>

            <Dialog.Content>
                <Dialog.Header>
                    <Dialog.Title>API Key</Dialog.Title>
                    <Dialog.Description>
                    One you close this dialog, the API key will no longer be visible.
                    </Dialog.Description>   
                        <div class="flex w-full max-w-sm items-center space-x-2">
                            <Input id="name" value={$page.form.key} class="col-span-3" readonly/>
                            <Dialog.Action class="w-auto" on:click={() => handleCopyKey($page.form.key)}>
                                <CopyIcon class="h-4 w-4 p-0"/>
                            </Dialog.Action>
                        </div>
                </Dialog.Header>
            </Dialog.Content>
        </Dialog.Root>
     {/if} 
    
</div>