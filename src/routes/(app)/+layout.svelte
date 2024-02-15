<script lang="ts">
    import "../../app.css";
    import { ModeWatcher } from "mode-watcher";
	import { onMount } from "svelte";
	import type { LayoutData } from "./$types";

  import * as Dialog from "$lib/components/ui/dialog";


  import { mediaQuery } from "svelte-legos";
	import Menu from "$lib/components/custom/Menu.svelte";

  import { Toaster } from "$lib/components/ui/sonner";
  export let data: LayoutData
  onMount(() => {
    console.log(data.user)
  })

  

  </script>

<ModeWatcher />
<Toaster />
  <!-- ========== HEADER ========== -->
  <Dialog.Root >
    <Menu user={data.user}/>
  </Dialog.Root>
  <!-- ========== END HEADER ========== -->
  <slot />