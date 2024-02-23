<script lang="ts">
    import "../app.css";
    import { ModeWatcher } from "mode-watcher";


  import { Toaster } from "$lib/components/ui/sonner";
	import { browser } from "$app/environment";
  import posthog from 'posthog-js' 
	import { beforeNavigate, afterNavigate } from "$app/navigation";
  if (browser) {
        beforeNavigate(() => posthog.capture('$pageleave'));
        afterNavigate(() => posthog.capture('$pageview'));
  }

</script>

<ModeWatcher />
<Toaster />
  <slot />