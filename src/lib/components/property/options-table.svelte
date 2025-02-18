<script lang="ts">
  import { type ColumnInitializer, DataTableCore } from "$lib/components/data-table/core";
  import { TableHeader } from "$lib/components/data-table/lib";
  import { EditDialog } from "$lib/components/edit-dialog";
  import { ProfilePicture } from "$lib/components/profile";
  import { Search } from "$lib/components/search";
  import { Button } from "$lib/components/ui/button";
  import type { ASelectProperty, SelectOption } from "$lib/model/core/property";
  import type { Display } from "$lib/ui";
  import { PlusIcon } from "lucide-svelte";
  import { createRender, FlatColumn } from "svelte-headless-table";
  import { createSortKeysStore, type WritableSortKeys } from "svelte-headless-table/plugins";
  import { type Writable, writable } from "svelte/store";

  let property: ASelectProperty<unknown>;
  let header = true;
  let rowActions = new Map<string, (item: SelectOption) => void>();
  let filterValue: Writable<string> = writable("");
  let sortKeys: WritableSortKeys = createSortKeysStore([]);
  let hideForId: Record<string, boolean> = {};
  let flatColumns: FlatColumn<SelectOption, any, string>[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  let className = "";

  let selected: SelectOption | undefined = undefined;
  let dialogOpen = false;
  let dialogTitle = "Edit Option";
  let columnInitializers: ColumnInitializer<SelectOption>[] = [
    {
      accessor: (row) => row as Display,
      cell: (cell) => createRender(ProfilePicture, { item: cell.value }),
      header: "Picture",
      id: "picture",
      plugins: {
        sort: {
          disable: true,
        },
        tableFilter: {
          disable: true,
        },
      },
    },
    {
      accessor: (row: SelectOption) => row.name,
      header: "Name",
      id: "name",
    },
    // {
    //   accessor: (row: SelectOption) => row.description,
    //   header: "Description",
    //   id: "description",
    // },
  ];

  let actions = new Map([...rowActions, ["Edit", rowClick], ["Delete", rowDelete]]);

  function rowClick(item: SelectOption) {
    dialogTitle = "Edit Option";
    selected = item;
    dialogOpen = true;
  }

  function rowDelete(item: SelectOption) {
    property.deleteOption(item);
  }

  function newOption() {
    dialogTitle = "Add Option";
    selected = {
      ...property.mkOption(),
    };
    dialogOpen = true;
  }

  function putOption(item: SelectOption) {
    property.putOption(item);
  }

  export { property, actions, header, className as class };
</script>

<div class="flex flex-col items-start justify-start {className}">
  <div class="mt-4 flex h-max w-full flex-col items-start justify-start overflow-y-scroll">
    {#if header}
      <TableHeader sticky={true}>
        <svelte:fragment slot="start">
          <Button
            class="text-muted-foreground hover:text-accent-foreground"
            on:click={newOption}
            size="icon-xl"
            variant="ghost"
          >
            <PlusIcon />
          </Button>
          <slot name="start" />
        </svelte:fragment>

        <svelte:fragment slot="middle">
          <slot name="middle" />
        </svelte:fragment>

        <svelte:fragment slot="end">
          <Search onInput={(s) => filterValue.set(s)} />
        </svelte:fragment>
      </TableHeader>
    {/if}
    <DataTableCore
      bind:filterValue
      bind:flatColumns
      bind:hideForId
      bind:sortKeys
      class="w-full"
      {columnInitializers}
      data={property.rOptions}
      {actions}
      defaultAction={rowClick}
    />
  </div>
</div>
<EditDialog
  item={selected}
  bind:open={dialogOpen}
  title={dialogTitle}
  onSubmit={(opt) => putOption(opt)}
/>
