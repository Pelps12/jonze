<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
	import { Save, Trash } from "lucide-svelte";

    export let handleSave: () => void;
    export let handleDelete: () => void;
  </script>

<Card.Root class="w-full relative mx-auto">

    <Card.Header>
        <div class="absolute top-0 right-0 m-4 flex gap-2">
            <Button size="icon" class="h-6 w-6" on:click={() => handleSave()}>
                <Save class="w-4 h-4" />
            </Button>
            <Button variant="destructive" size="icon" class="h-6 w-6" on:click={() => handleDelete()}>
                <Trash  class="w-4 h-4"/>
            </Button>
            
            
        </div>
    </Card.Header>
    <Card.Content>
        
            

    
        <slot/>
    </Card.Content>
</Card.Root>