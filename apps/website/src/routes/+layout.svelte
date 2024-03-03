<script lang="ts">
    import "../app.css";
    import { ModeWatcher } from "mode-watcher";
    import {page} from "$app/stores"


  import { Toaster } from "$lib/components/ui/sonner";
	import { browser } from "$app/environment";
  import posthog from 'posthog-js' 
	import { beforeNavigate, afterNavigate } from "$app/navigation";
	import type { LayoutData } from "./$types";
  export let data: LayoutData
  if (browser) {
        beforeNavigate(() => posthog.capture('$pageleave'));
        afterNavigate(() => posthog.capture('$pageview'));
        if($page.url.searchParams.get("signedIn") === "true" && data.user){
          posthog.identify(data.user.id,{
            email: data.user.email,
            name: data.user.firstName + " " + data.user.lastName
          })
        }
        else if(!data.user){
          posthog.reset()
        }
  }




</script>

<ModeWatcher />
<Toaster />

<svelte:head>
  <title>Jonze</title>
</svelte:head>

  <slot />