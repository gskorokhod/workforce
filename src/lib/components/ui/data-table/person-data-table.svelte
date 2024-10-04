<script lang="ts">
  import { Person, Skill, State } from "$lib/model";
  import type { Display } from "$lib/model/ui";
  import { state as GLOBAL_STATE } from "$lib/model";
  import { createRender, FlatColumn, type ReadOrWritable } from "svelte-headless-table";
  import {
    type AnyPlugins,
    createSortKeysStore,
    type WritableSortKeys
  } from "svelte-headless-table/plugins";
  import { type Writable, writable } from "svelte/store";
  import { Search } from "../search";
  import { Button } from "../button";
  import { PlusIcon } from "lucide-svelte";
  import { ProfilePicture, ProfilesList } from "../profile-picture";
  import { type ColumnInitializer, DataTableCore } from "./core";
  import { EditDialog } from "../edit-dialog";
  import { TableHeader, ColumnHideSelector } from "./lib";

  let data: ReadOrWritable<Person[]>;
  let header: boolean = true;
  let state: State = GLOBAL_STATE;
  let rowActions: Map<string, (item: Person) => void> = new Map();
  let filterValue: Writable<string> = writable("");
  let sortKeys: WritableSortKeys = createSortKeysStore([]);
  let hideForId: { [key: string]: boolean } = {};
  let flatColumns: FlatColumn<Person, AnyPlugins, string>[];
  let className: string = "";

  let selected: Person | undefined = undefined;
  let dialogOpen: boolean = false;
  let dialogTitle: string = "Edit Person";
  let columnInitializers: ColumnInitializer<Person>[] = [
    {
      accessor: (row) => row as Display,
      cell: (cell) => createRender(ProfilePicture, { item: cell.value }),
      header: "Avatar",
      id: "avatar",
      plugins: {
        sort: {
          disable: true
        },
        tableFilter: {
          disable: true
        }
      }
    },
    {
      accessor: (row: Person) => row.name,
      header: "Name",
      id: "name"
    },
    {
      accessor: (row: Person) => row.age,
      header: "Age",
      id: "age"
    },
    {
      accessor: (row: Person) => row.job,
      header: "Job Title",
      id: "job"
    },
    {
      accessor: (row: Person) => row.skills,
      cell: (cell) => createRender(ProfilesList, { items: cell.value, placeholder: "No Skills" }),
      header: "Skills",
      id: "skills",
      plugins: {
        sort: {
          getSortValue: (value: Skill[]) => value.map((skill) => skill.name).join(" ")
        },
        tableFilter: {
          getFilterValue: (value: Skill[]) => value.map((skill) => skill.name).join(" ")
        }
      }
    }
  ];

  let actions = new Map([
    ...rowActions,
    ["Edit", (item: Person) => rowClick(item)],
    ["Delete", (item: Person) => item.delete()]
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
