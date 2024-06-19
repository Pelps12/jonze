<script lang="ts">
    import { onMount } from 'svelte';
    import Button from '@/components/ui/Button.svelte';
    import Popover, { Trigger as PopoverTrigger, Content as PopoverContent } from '@/components/ui/Popover.svelte';
    import Command, { Group as CommandGroup, Item as CommandItem, Input as CommandInput, Empty as CommandEmpty } from '@/components/ui/Command.svelte';
    import ScrollArea from './ScrollArea.svelte';
    import { Check, ChevronsUpDown } from 'lucide-svelte';
  
    export type ComboboxOptions = {
      value: string;
      label: string;
    };
  
    type Mode = 'single' | 'multiple';
  
    interface ComboboxProps {
      mode?: Mode;
      options: ComboboxOptions[];
      selected: string | string[]; // Updated to handle multiple selections
      className?: string;
      placeholder?: string;
      onChange?: (event: string | string[]) => void; // Updated to handle multiple selections
      onCreate?: (value: string) => void;
    }
  
    export let mode: Mode = 'single';
    export let options: ComboboxOptions[] = [];
    export let selected: string | string[] = [];
    export let className: string = '';
    export let placeholder: string = 'Select Item...';
    export let onChange: (value: string | string[]) => void;
    export let onCreate: (value: string) => void;
  
    let open: boolean = false;
    let query: string = '';
  
    function handleSelect(option: ComboboxOptions): void {
      if (mode === 'multiple' && Array.isArray(selected)) {
        onChange(
          selected.includes(option.value)
            ? selected.filter((item: string) => item !== option.value)
            : [...selected, option.value]
        );
      } else if (mode === 'single') {
        onChange(option.value);
      }
    }
  
    function displaySelected(): string {
      if (mode === 'multiple' && Array.isArray(selected)) {
        return selected.map(s => options.find(o => o.value === s)?.label).join(', ');
      } else {
        return options.find(o => o.value === selected)?.label || '';
      }
    }
  </script>
  
  <div class={className}>
    <Popover {open} on:openChange={(e) => open = e.detail}>
      <PopoverTrigger slot="trigger">
        <Button variant="outline" role="combobox" aria-expanded={open} class="w-full justify-between">
          {#if selected && (Array.isArray(selected) ? selected.length > 0 : selected)}
            <div class="relative mr-auto flex flex-grow flex-wrap items-center overflow-hidden">
              <span>{displaySelected()}</span>
            </div>
          {:else}
            {placeholder}
          {/if}
          <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-72 max-w-sm p-0">
        <Command filter={(value: string, search: string) => value.includes(search) ? 1 : 0}>
          <CommandInput bind:value={query} placeholder={placeholder} />
          <CommandEmpty on:click={() => { onCreate(query); query = ''; }} class="flex cursor-pointer items-center justify-center gap-1 italic">
            <p>Create: </p>
            <p class="block max-w-48 truncate font-semibold text-primary">{query}</p>
          </CommandEmpty>
          <ScrollArea>
            <div class="max-h-80">
              <CommandGroup>
                {#each options as option}
                  <CommandItem {option.label} on:select={() => handleSelect(option)}>
                    <Check class:selected="{Array.isArray(selected) ? selected.includes(option.value) : selected === option.value}" />
                    {option.label}
                  </CommandItem>
                {/each}
              </CommandGroup>
            </div>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  </div>
  