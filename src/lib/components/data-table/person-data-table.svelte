<script lang="ts">
  import { state as GLOBAL_STATE, Person, Qualification, State } from "$lib/model";
  import type { Display } from "$lib/ui";
  import { PlusIcon } from "lucide-svelte";
  import { createRender, FlatColumn, type ReadOrWritable } from "svelte-headless-table";
  import { createSortKeysStore, type WritableSortKeys } from "svelte-headless-table/plugins";
  import { type Writable, writable } from "svelte/store";
  import { Button } from "../button";
  import { EditDialog } from "../edit-dialog";
  import { ProfilePicture, ProfilesList } from "../profile-picture";
  import { Search } from "../search";
  import { type ColumnInitializer, DataTableCore } from "./core";
  import { ColumnHideSelector, TableHeader } from "./lib";

  let data: ReadOrWritable<Person[]>;
  let header = true;
  let state: State = GLOBAL_STATE;
  let rowActions = new Map<string, (item: Person) => void>();
  let filterValue: Writable<string> = writable("");
  let sortKeys: WritableSortKeys = createSortKeysStore([]);
  let hideForId: Record<string, boolean> = {};
  let flatColumns: FlatColumn<Person, any, string>[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  let className = "";

  let selected: Person | undefined = undefined;
  let dialogOpen = false;
  let dialogTitle = "Edit Person";
  let columnInitializers: ColumnInitializer<Person>[] = [
    {
      accessor: (row) => row as Display,
      cell: (cell) => createRender(ProfilePicture, { item: cell.value }),
      header: "Avatar",
      id: "avatar",
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
      accessor: (row: Person) => row.name,
      header: "Name",
      id: "name",
    },
    {
      accessor: (row: Person) => row.age,
      header: "Age",
      id: "age",
    },
    {
      accessor: (row: Person) => row.role,
      header: "Role",
      id: "role",
    },
    {
      accessor: (row: Person) => row.qualifications,
      cell: (cell) => createRender(ProfilesList, { items: cell.value, placeholder: "No Qualifications" }),
      header: "Qualifications",
      id: "qualifications",
      plugins: {
        sort: {
          getSortValue: (value: Qualification[]) => value.map((val) => val.name).join(" "),
        },
        tableFilter: {
          getFilterValue: (value: Qualification[]) => value.map((val) => val.name).join(" "),
        },
      },
    },
  ];

  let actions = new Map([
    ...rowActions,
    ["Edit", (item: Person) => rowClick(item)],
    ["Delete", (item: Person) => item.delete()],
  ]);

  function rowClick(item: Person) {
    dialogTitle = "Edit Person";
    selected = item;
    dialogOpen = true;
  }

  function newPerson() {
    dialogTitle = "Create new Person";
    selected = new Person({}, state);
    dialogOpen = true;
  }

  export { data, actions, header, state, className as class };
</script>

<div class="flex flex-col items-start justify-start {className}">
  {#if header}
    <TableHeader sticky={true}>
      <svelte:fragment slot="start">
        <Button
          class="text-muted-foreground hover:text-accent-foreground"
          on:click={newPerson}
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
        <ColumnHideSelector bind:hideForId {flatColumns} />
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
    {data}
    {actions}
    defaultAction={rowClick}
  />
</div>
<EditDialog item={selected} bind:open={dialogOpen} title={dialogTitle} />
