<script lang="ts">
  import { Person, Task, Skill, State } from "$lib/model";
  import type { Display } from "$lib/ui";
  import { state as GLOBAL_STATE } from "$lib/model";
  import { createRender, FlatColumn, type ReadOrWritable } from "svelte-headless-table";
  import { createSortKeysStore, type WritableSortKeys } from "svelte-headless-table/plugins";
  import { type Writable, writable } from "svelte/store";
  import { Search } from "../search";
  import { Button } from "../button";
  import { PlusIcon } from "lucide-svelte";
  import { ProfilePicture, ProfilesList } from "../profile-picture";
  import { type ColumnInitializer, DataTableCore } from "./core";
  import { EditDialog } from "../edit-dialog";
  import { TableHeader, ColumnHideSelector } from "./lib";

  let data: ReadOrWritable<Skill[]>;
  let header = true;
  let state: State = GLOBAL_STATE;
  let rowActions = new Map<string, (item: Skill) => void>();
  let filterValue: Writable<string> = writable("");
  let sortKeys: WritableSortKeys = createSortKeysStore([]);
  let hideForId: Record<string, boolean> = {};
  let flatColumns: FlatColumn<Skill, any, string>[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  let className = "";

  let selected: Skill | undefined = undefined;
  let dialogOpen = false;
  let dialogTitle = "Edit Person";
  let columnInitializers: ColumnInitializer<Skill>[] = [
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
      accessor: (row: Skill) => row.name,
      header: "Name",
      id: "name",
    },
    {
      accessor: (row: Skill) => row.getPeople(),
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
      accessor: (row: Skill) => row.getTasks(),
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
    ["Edit", (item: Skill) => rowClick(item)],
    ["Delete", (item: Skill) => item.delete()],
  ]);

  function rowClick(item: Skill) {
    dialogTitle = "Edit Skill";
    selected = item;
    dialogOpen = true;
  }

  function newSkill() {
    dialogTitle = "Create new Skill";
    selected = new Skill({}, state);
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
