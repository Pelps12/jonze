<script lang="ts">
	import { Button, buttonVariants } from "$lib/components/ui/button";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import { MoreHorizontal } from "lucide-svelte";
    import * as Dialog from "$lib/components/ui/dialog";
	import { Label } from "$lib/components/ui/label";
	import { Input } from "$lib/components/ui/input";
	import Preview from "$lib/components/custom/form/UI/Preview.svelte";
	import type { CustomForm } from "$lib/types/forms";
    import {page} from "$app/stores"
    export let form: CustomForm;
    export let response: Record<string, string>;
    export let memberId: string;


</script>



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
        <DropdownMenu.Content class="w-[160px]" align="end">
            
                <DropdownMenu.Item>
                    <Dialog.Trigger>
                        Additional Info
                    </Dialog.Trigger
                >
                </DropdownMenu.Item>
                

            
            <DropdownMenu.Item href={`/org/${$page.params.id}/members/${memberId}`}>Details</DropdownMenu.Item>
            <DropdownMenu.Item>Favorite</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Separator />
            <DropdownMenu.Item>
                Delete
                <DropdownMenu.Shortcut>⌘⌫</DropdownMenu.Shortcut>
            </DropdownMenu.Item>
        </DropdownMenu.Content>

        <Dialog.Content class="sm:max-w-[425px]">
            <Dialog.Header>
                <Dialog.Title>User Info</Dialog.Title>
                <Dialog.Description>
                    Additional fields you asked for from "User Info" form
                </Dialog.Description>
            </Dialog.Header>
            <Preview form={form} userResponse={response}/>
        </Dialog.Content>
    </DropdownMenu.Root>
</Dialog.Root>