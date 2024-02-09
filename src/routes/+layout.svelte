<script>
    import "../app.css";
    import { ModeWatcher } from "mode-watcher";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { Button } from "$lib/components/ui/button";
  import { Sun, Moon } from "lucide-svelte";
  import { setMode, resetMode } from "mode-watcher";
  </script>

<ModeWatcher />
  <!-- ========== HEADER ========== -->
  <header class="flex flex-wrap sm:justify-start sm:flex-nowrap z-50 w-full border-b text-sm py-2.5 sm:py-4 ">
    <nav class="max-w-7xl flex basis-full items-center w-full mx-auto px-4 sm:px-6 lg:px-8" aria-label="Global">
      <div class="me-5 md:me-8">
        <a class="flex-none text-xl font-semibold dark:text-white d " href="#" aria-label="Brand">Brand</a>
      </div>

      <div class="w-full flex items-center justify-end ms-auto sm:gap-x-3 sm:order-3">


        <div class="flex flex-row items-center justify-end gap-2">
          <DropdownMenu.Root>
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


          <!-- <div class="hs-dropdown relative inline-flex" data-hs-dropdown-placement="bottom-right">
            <button id="hs-dropdown-with-header" type="button" class="hs-dropdown-toggle w-[2.375rem] h-[2.375rem] inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full   disabled:opacity-50 disabled:pointer-events-none   d ">
              <img class="inline-block h-[2.375rem] w-[2.375rem] rounded-full ring-2 " src="https://pbs.twimg.com/profile_images/1134078874747396098/GncCcCOD_400x400.jpg" alt="Profile">
            </button>

          </div> -->
        </div>
      </div>
    </nav>
  </header>
  <!-- ========== END HEADER ========== -->
  <slot />