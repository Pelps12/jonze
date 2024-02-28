<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
  import { mediaQuery } from "svelte-legos";
	import { page } from "$app/stores";

  export let data;
</script>

<div class="flex justify-between items-center mb-6">
    <h2 class="text-xl font-semibold">Forms</h2>
    <div class="flex space-x-2">
        <Button variant="outline" href={`forms/create`}>Add Form</Button>

    </div>
  </div>
  <div class="p-6 grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
    {#each data.forms as form}
    <Card.Root class="w-[350px]">
      <Card.Header>
        <Card.Title>{form.name}</Card.Title>
        <Card.Description>
            Last edited {form.updatedAt.toLocaleString('en-US', {
              month: 'short', // abbreviated month name
              day: 'numeric', // numeric day
              hour: 'numeric', // numeric hour
              minute: '2-digit', // 2-digit minute
              hour12: true // 12-hour time format
            })}
        </Card.Description>
      </Card.Header>

      <Card.Footer class="flex justify-between">
        <Button variant="outline" href={`/org/${$page.params.id}/forms/${form.id}`}>Edit</Button>
        <Button href={`/org/${$page.params.id}/forms/${form.id}/responses`}>Responses</Button>
        
      </Card.Footer>
    </Card.Root>

    {/each}
  </div>