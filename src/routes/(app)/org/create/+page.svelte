<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
  
  </script>
  <div class="w-[100vw] h-[100vh] flex justify-center items-center">
    <Card.Root class="w-[350px]">
        <Card.Header>
          <Card.Title>Create org</Card.Title>
          <Card.Description>Add your organization in one-click.</Card.Description>
        </Card.Header>
        <form method="post" action="?/create">
            <Card.Content>
            
                <div class="grid w-full items-center gap-4">
                <div class="flex flex-col space-y-1.5">
                    <Label for="name">Name</Label>
                    <Input id="name" name="name" placeholder="Name of your org" />
                </div>
                </div>
            
            </Card.Content>
            <Card.Footer class="flex justify-end">
            
            
            <Button type="submit">Create</Button>
            
            
            </Card.Footer>
    </form>
    </Card.Root>
  </div>
