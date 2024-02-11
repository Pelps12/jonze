<script lang="ts">
    import "../app.css";
    import { ModeWatcher } from "mode-watcher";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { Button } from "$lib/components/ui/button";
  import { Sun, Moon } from "lucide-svelte";
  import { setMode, resetMode } from "mode-watcher";
	import { onMount } from "svelte";
	import type { LayoutData } from "./$types";
	import * as Avatar from "$lib/components/ui/avatar";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Drawer from "$lib/components/ui/drawer";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";

  import { mediaQuery } from "svelte-legos";
	import Menu from "$lib/components/custom/Menu.svelte";
  let open = false;
  const isDesktop = mediaQuery("(min-width: 768px)");

  export let data: LayoutData
  onMount(() => {
    console.log(data.user)
  })

  const handleLogout = () => {
    fetch("/api/auth/logout", {
      method: "POST"
    })
  }

  const username = ((data.user?.firstName ?? "No")+ " " + (data.user?.lastName ?? "Name"))

  </script>

<ModeWatcher />
  <!-- ========== HEADER ========== -->
  <Dialog.Root >
    <Menu user={data.user}/>
  </Dialog.Root>
  <!-- ========== END HEADER ========== -->
  <slot />