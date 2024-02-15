<script lang="ts">
	import { goto, preloadData, pushState } from "$app/navigation";
	import { page } from "$app/stores";
	import { Button, type ButtonEvents } from "$lib/components/ui/button";
	import { cn } from "$lib/utils";
	import { CalendarIcon, FileText, FolderIcon, HomeIcon, SettingsIcon, UsersIcon } from "lucide-svelte";
	import type { KeyboardEventHandler } from "svelte/elements";
	let className: string | null | undefined = undefined;

	export { className as class };

</script>

<div class={cn(" h-[100vh] ", className)}>
	<div class="space-y-4 py-4 ">
		<div class="px-3 py-2 ">
			  <Button
          class="w-full justify-start gap-2"
          variant="ghost"
          href="/org/{$page.params.id}"
        >
          <HomeIcon class="h-4 w-4" />
            Home
        </Button>
        <Button
          class="w-full justify-start gap-2"
          href="/org/{$page.params.id}/events"
          variant="ghost"
        >
          <CalendarIcon class="h-4 w-4" />
            Events
        </Button>
        <Button
          class="w-full justify-start gap-2"
          href="/org/{$page.params.id}/members"
          variant="ghost"
        >
          <UsersIcon class="h-4 w-4" />
          Members
        </Button>
        <Button
          class="w-full justify-start gap-2"
          href="/org/{$page.params.id}/forms"
          variant="ghost"
        >
          <FileText class="h-4 w-4"/>
          Forms
        </Button>
        <Button
          class="w-full justify-start gap-2"
          href="#"
          variant="ghost"
        >
          <SettingsIcon class="h-4 w-4" />
          Settings
        </Button>
		</div>
	</div>
</div>