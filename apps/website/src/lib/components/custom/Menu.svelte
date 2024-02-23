<script lang="ts">
    import { ModeWatcher } from "mode-watcher";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { Button } from "$lib/components/ui/button";
  import { Sun, Moon, UserPlus, PlusCircle, MessageSquare } from "lucide-svelte";
  import { setMode, resetMode } from "mode-watcher";
	import { onMount } from "svelte";
	import * as Avatar from "$lib/components/ui/avatar";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Drawer from "$lib/components/ui/drawer";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";

  import { mediaQuery } from "svelte-legos";
	import type { Organization, User } from "@workos-inc/node";
	import { page } from "$app/stores";
  let open = false;
  const isDesktop = mediaQuery("(min-width: 768px)");

  export let user: User & { orgs: Pick<Organization, 'id' | 'name'>[] } | null | undefined; 
  onMount(() => {
    console.log(user)
    console.log($page)
  })

  
  let currentOrg = user?.orgs.find(org => org.id === $page.params.id);

  page.subscribe(() => {
    currentOrg = user?.orgs.find(org => org.id === $page.params.id);
  })
  $: currentOrg, console.log(currentOrg)
  const handleLogout = () => {
    fetch("/api/auth/logout", {
      method: "POST"
    })
  }

  const username = ((user?.firstName ?? "No")+ " " + (user?.lastName ?? "Name"))

  </script>

<ModeWatcher />
  <!-- ========== HEADER ========== -->
  <header class="flex flex-wrap sm:justify-start sm:flex-nowrap z-50 w-full border-b text-sm py-2.5 sm:py-4 ">
    <nav class=" flex basis-full items-center w-full mx-auto px-4 sm:px-6 lg:px-8" aria-label="Global">
      <div class="w-full">
        <a class="flex-none text-xl font-semibold dark:text-white d " href={currentOrg ? `/org/${currentOrg.id}`: "/"} aria-label="Jonze">{currentOrg?.name ?? "Jonze"}</a>
      </div>

      <div class="w-full flex items-center justify-end ms-auto sm:gap-x-3 sm:order-3">


        <div class="flex flex-row items-center justify-end gap-2">
          <DropdownMenu.Root closeOnItemClick={false}>
            <DropdownMenu.Trigger asChild let:builder>
              <Button builders={[builder]} variant="outline" size="icon">
                <Sun
                  class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
                />
                <Moon
                  class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
                />
                <span class="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">
              <DropdownMenu.Item on:click={() => setMode("light")}
                >Light</DropdownMenu.Item
              >
              <DropdownMenu.Item on:click={() => setMode("dark")}>Dark</DropdownMenu.Item>
              <DropdownMenu.Item on:click={() => resetMode()}>System</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          {#if user}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild let:builder>
              <Button variant="ghost" builders={[builder]} class="relative h-8 w-8 rounded-full">
                <Avatar.Root>
                  <Avatar.Image src={user?.profilePictureUrl} alt="@shadcn" />
                  <Avatar.Fallback>{(user.firstName?.charAt(0) ?? "U") + (user.lastName?.charAt(0) ?? "")}</Avatar.Fallback>
                </Avatar.Root>
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content class="w-56" align="end">
              <DropdownMenu.Label class="font-normal">
                <div class="flex flex-col space-y-1">
                  <p class="text-sm font-medium leading-none">{username}</p>
                  <p class="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenu.Label>
              <DropdownMenu.Separator />
              <DropdownMenu.Group>

                <DropdownMenu.Sub>
                    <DropdownMenu.SubTrigger>
                      <UserPlus class="mr-2 h-4 w-4" />
                      <span>Teams</span>
                    </DropdownMenu.SubTrigger>
                    <DropdownMenu.SubContent>
                        {#each user.orgs as org}
                            <a href={`/org/${org.id}`}>
                                <DropdownMenu.CheckboxItem  id={org.id} checked={org.id === $page.params?.id}>
                                    {org.name}  
                                </DropdownMenu.CheckboxItem >
                            </a>
                        {/each}
                      
                      <DropdownMenu.Item href="/org/create"> 
                        <PlusCircle class="mr-2 h-4 w-4"/> 
                            <span>New Org</span>
                    </DropdownMenu.Item> 
                    </DropdownMenu.SubContent>
                  </DropdownMenu.Sub>
               
              </DropdownMenu.Group>
              <DropdownMenu.Separator />
              
              <DropdownMenu.Item on:click={() => handleLogout()}>
                  Log out
                  <DropdownMenu.Shortcut>⇧⌘Q</DropdownMenu.Shortcut>
              </DropdownMenu.Item>
              

            </DropdownMenu.Content>
          </DropdownMenu.Root>

          {:else}
            <Button variant="secondary" class="gap-2" href="/api/auth">
              Log In
            </Button>
          {/if}
          
          
          
        </div>
      </div>
    </nav>
  </header>
  <!-- ========== END HEADER ========== -->
  <slot />