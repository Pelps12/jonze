<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import * as Alert from "$lib/components/ui/alert";
	import Preview from "$lib/components/custom/form/UI/Preview.svelte";
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import { page } from "$app/stores";
	import { toast } from "svelte-sonner";
	import { goto } from "$app/navigation";
    export let data;
    let filled = data.formFilled


</script>
  
{#if filled}
<Alert.Root>
    <Alert.Title>Attendance Already Filled!</Alert.Title>
    <Alert.Description
      >You've probably filled this attendance before</Alert.Description
    >
  </Alert.Root>
{/if}
  <div class="flex justify-center items-center h-[100vh]">
    <form method="post">
        <Card.Root class="w-[350px]">
            <div class="relative flex items-start space-x-4 p-4">
                <Avatar.Root class="w-10 h-10 border">
                    <Avatar.Image src={data.user.profilePictureUrl} />
                    <Avatar.Fallback>{(data.user.firstName?.charAt(0) ?? "U") + (data.user.lastName?.charAt(0) ?? "")}</Avatar.Fallback>
                </Avatar.Root>
                <div class="text-sm grid gap-1">
                    <Card.Title class="text-base font-semibold">
                        {((data.user.firstName ?? "No")+ " " + (data.user.lastName ?? "Name"))}
                    </Card.Title>
                    <Card.Description class="text-sm">
                        {data.user.email}
                    </Card.Description>
                </div>
            </div>
            <Card.Header>
            <Card.Title>Attendance for {data.event.name}</Card.Title>
            </Card.Header>
            <Card.Content>
                
                {#if data.event.form}
                    
                        <Preview form={data.event.form.form} userResponse={undefined}/>
                    
                {/if}

            </Card.Content>
            <Card.Footer class="flex justify-center">
            <Button disabled={filled} type="submit">Mark Attendance</Button>
            </Card.Footer>
        </Card.Root>
    </form>
  </div>
