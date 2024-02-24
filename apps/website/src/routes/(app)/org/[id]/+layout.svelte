<script lang="ts">
	import { onMount } from "svelte";


	import Sidebar from "./Sidebar.svelte";
    import Calculator from "lucide-svelte/icons/calculator";
    import Calendar from "lucide-svelte/icons/calendar";
    import CreditCard from "lucide-svelte/icons/credit-card";
    import Settings from "lucide-svelte/icons/settings";
    import Smile from "lucide-svelte/icons/smile";
    import User from "lucide-svelte/icons/user";
    import * as Command from "$lib/components/ui/command";

    let commandBoxOpen = false

    onMount(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        commandBoxOpen = !commandBoxOpen;
      }
    }
 
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  });
	
	

</script>
<div class="lg:grid lg:grid-cols-5">
    <Sidebar class="" />
    <div class="lg:col-span-4 border-t lg:border-l p-3">
        <slot/>
    </div>
</div>


<Command.Dialog bind:open={commandBoxOpen}>
    <Command.Input placeholder="Type a command or search..." />
    <Command.List>
      <Command.Empty>No results found.</Command.Empty>
      <Command.Group heading="Suggestions">
        <Command.Item>
          <Calendar class="mr-2 h-4 w-4" />
          <span>Calendar</span>
        </Command.Item>
        <Command.Item>
          <Smile class="mr-2 h-4 w-4" />
          <span>Search Emoji</span>
        </Command.Item>
        <Command.Item>
          <Calculator class="mr-2 h-4 w-4" />
          <span>Calculator</span>
        </Command.Item>
      </Command.Group>
      <Command.Separator />
      <Command.Group heading="Settings">
        <Command.Item>
          <User class="mr-2 h-4 w-4" />
          <span>Profile</span>
          <Command.Shortcut>⌘P</Command.Shortcut>
        </Command.Item>
        <Command.Item>
          <CreditCard class="mr-2 h-4 w-4" />
          <span>Billing</span>
          <Command.Shortcut>⌘B</Command.Shortcut>
        </Command.Item>
        <Command.Item>
          <Settings class="mr-2 h-4 w-4" />
          <span>Settings</span>
          <Command.Shortcut>⌘S</Command.Shortcut>
        </Command.Item>
      </Command.Group>
    </Command.List>
  </Command.Dialog>