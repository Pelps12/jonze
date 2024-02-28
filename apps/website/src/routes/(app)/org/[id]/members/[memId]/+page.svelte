<script lang="ts">
	import type { PageData } from "./$types";
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
	import { ChevronDown, CopyIcon, PlusCircle, TrashIcon } from "lucide-svelte";
    import {enhance} from "$app/forms"
	import { page } from "$app/stores";
    import * as Dialog from "$lib/components/ui/alert-dialog";
	import { Input } from "$lib/components/ui/input";
    import * as Popover from "$lib/components/ui/popover";
    import * as Command from "$lib/components/ui/command";
	import { browser } from "$app/environment";
    import * as Table from "$lib/components/ui/table";
    import * as Avatar from "$lib/components/ui/avatar";
    import { createRender, createTable, Render, Subscribe } from "svelte-headless-table";
    import { readable } from "svelte/store";

    export let data: PageData;

    const table = createTable(readable(data.member.attendances));
    const columns = table.createColumns([
      table.column({
        accessor: (item) => item.event.name,
        header: "Event Name",
      }),
      table.column({   
        accessor: (item) => item.createdAt,
        header: "Attended At",
        cell: ({ value }) => {
          return value.toLocaleString('en-US', {
            month: 'short', 
            day: 'numeric', 
            hour: 'numeric', 
            minute: '2-digit', 
            second:'numeric',
            hour12: true 
        });
      },
      }),
    ]);
    const { headerRows, pageRows, tableAttrs, tableBodyAttrs } =
      table.createViewModel(columns);
</script>

<Card.Root class="max-w-md">
    <Card.Header>
        <Card.Title>Member</Card.Title>
    </Card.Header>
    <Card.Content class="grid gap-6 ">
            <div class="flex items-center justify-between space-x-4 relative">
                <div class="flex items-center space-x-4">
                    <Avatar.Root>
                        <Avatar.Image src={data.member.user.profilePictureUrl} alt={data.member.user.firstName} />
                        <Avatar.Fallback>U</Avatar.Fallback>
                    </Avatar.Root>
                    <div>
                        <p class="text-sm font-medium leading-none">{data.member.user.firstName} {data.member.user.lastName}</p>
                        <p class="text-sm text-muted-foreground">{data.member.user.email}</p>
                    </div>
                </div>

                <div class="ml-auto absolute right-0 text-sm self-center flex flex-col items-end">
                    <div>Joined</div>
                    <div>
                        {data.member.createdAt.toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: "numeric",
                            minute:"numeric"
                            })}
                    </div>
                    
                    
                </div>
            </div>
    </Card.Content>
</Card.Root>

<div class="rounded-md border ">
    <Table.Root {...$tableAttrs}>
      <Table.Header>
        {#each $headerRows as headerRow}
          <Subscribe rowAttrs={headerRow.attrs()}>
            <Table.Row>
              {#each headerRow.cells as cell (cell.id)}
                <Subscribe attrs={cell.attrs()} let:attrs props={cell.props()}>
                  <Table.Head {...attrs}>
                    <Render of={cell.render()} />
                  </Table.Head>
                </Subscribe>
              {/each}
            </Table.Row>
          </Subscribe>
        {/each}
      </Table.Header>
      <Table.Body {...$tableBodyAttrs}>
        {#each $pageRows as row (row.id)}
          <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
            <Table.Row {...rowAttrs}>
              {#each row.cells as cell (cell.id)}
                <Subscribe attrs={cell.attrs()} let:attrs>
                  <Table.Cell {...attrs}>
                    <Render of={cell.render()} />
                  </Table.Cell>
                </Subscribe>
              {/each}
            </Table.Row>
          </Subscribe>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>