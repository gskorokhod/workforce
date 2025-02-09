<script lang="ts">
  import { state as GLOBAL_STATE, Person, Qualification, State, Task } from "$lib/model";
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

  let data: ReadOrWritable<Qualification[]>;
  let header = true;
  let state: State = GLOBAL_STATE;
  let rowActions = new Map<string, (item: Qualification) => void>();
  let filterValue: Writable<string> = writable("");
  let sortKeys: WritableSortKeys = createSortKeysStore([]);
  let hideForId: Record<string, boolean> = {};
  let flatColumns: FlatColumn<Qualification, any, string>[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  let className = "";

  let selected: Qualification | undefined = undefined;
  let dialogOpen = false;
  let dialogTitle = "Edit Person";
  let columnInitializers: ColumnInitializer<Qualification>[] = [
    {
      accessor: (row) => row as Display,
      cell: (cell) => createRender(ProfilePicture, { item: cell.value }),
      header: "Icon",
      id: "icon",
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
      accessor: (row: Qualification) => row.name,
      header: "Name",
      id: "name",
    },
    {
      accessor: (row: Qualification) => row.getPeople(),
      cell: (cell) => createRender(ProfilesList, { items: cell.value, placeholder: "No People" }),
      header: "People with Skill",
      id: "people",
      plugins: {
        sort: {
          getSortValue: (value: Person[]) => value.map((p) => p.name).join(" "),
        },
        tableFilter: {
          getFilterValue: (value: Person[]) => value.map((p) => p.name).join(" "),
        },
      },
    },
    {
      accessor: (row: Qualification) => row.getTasks(),
      cell: (cell) => createRender(ProfilesList, { items: cell.value, placeholder: "No Tasks" }),
      header: "Tasks requiring Skill",
      id: "tasks",
      plugins: {
        sort: {
          getSortValue: (value: Task[]) => value.map((t) => t.name).join(" "),
        },
        tableFilter: {
          getFilterValue: (value: Task[]) => value.map((t) => t.name).join(" "),
        },
      },
    },
  ];

  let actions = new Map([
    ...rowActions,
    ["Edit", (item: Qualification) => rowClick(item)],
    ["Delete", (item: Qualification) => item.delete()],
  ]);

  function rowClick(item: Qualification) {
    dialogTitle = "Edit Skill";
    selected = item;
    dialogOpen = true;
  }

  function newSkill() {
    dialogTitle = "Create new Skill";
    selected = new Qualification({}, state);
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
          on:click={newSkill}
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
