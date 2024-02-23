<script lang="ts">
    import "../app.css";
    import { ModeWatcher } from "mode-watcher";
    import {page} from "$app/stores"


  import { Toaster } from "$lib/components/ui/sonner";
	import { browser } from "$app/environment";
  import posthog from 'posthog-js' 
	import { beforeNavigate, afterNavigate } from "$app/navigation";
	import type { LayoutData } from "./$types";
  if (browser) {
        beforeNavigate(() => posthog.capture('$pageleave'));
        afterNavigate(() => posthog.capture('$pageview'));
  }
  export let data: LayoutData

  if($page.url.searchParams.get("signedIn") === "true" && data.user){
    posthog.identify(data.user.id,{
      email: data.user.email,
      name: data.user.firstName + " " + data.user.lastName
    })
  }
  if(!data.user){
    posthog.reset()
  }

</script>

<ModeWatcher />
<Toaster />
  <slot />