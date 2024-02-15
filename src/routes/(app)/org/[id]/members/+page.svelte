<script lang="ts">
    import DataTable from "./data-table.svelte";
    import * as Card from "$lib/components/ui/card";
	import * as Avatar from "$lib/components/ui/avatar";
	import { page } from "$app/stores";
	import { Button } from "$lib/components/ui/button";
	import * as Alert from "$lib/components/ui/alert";
    export let data;
  </script>
{#if data.organizationForm}
    <Card.Root class="w-[350px]">
        <Card.Header>
        <Card.Title>{data.organizationForm.name}</Card.Title>
        <Card.Description>Last edited {data.organizationForm.updatedAt.toLocaleString('en-US', {
            month: 'short', // abbreviated month name
            day: 'numeric', // numeric day
            hour: 'numeric', // numeric hour
            minute: '2-digit', // 2-digit minute
            hour12: true // 12-hour time format
        })}</Card.Description>
        </Card.Header>

        <Card.Footer class="flex justify-between">
        <Button variant="outline" href={`/org/${$page.params.id}/forms/${data.organizationForm.id}`}>Edit</Button>
        <Button href={`/org/${$page.params.id}/forms/${data.organizationForm.id}?preview=true`}>Preview</Button>
        
        </Card.Footer>
    </Card.Root>
{:else}
    <Alert.Root>
        <Alert.Title>Heads up!</Alert.Title>
        <Alert.Description class="flex justify-between gap-2 items-center">
            <p>You can create a user info form to request more info on sign up.
                However, it must be labeled "User Info"
            </p>
        
            <Button href={`/org/${$page.params.id}/forms/create`}>ADD</Button>
        </Alert.Description>
    </Alert.Root>
{/if}



  <div class="container mx-auto py-10">
    <DataTable members={data.members}/>
  </div>