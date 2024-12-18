<script lang="ts">
  import { state as GLOBAL_STATE, Shift, State, Task } from "$lib/model";
  import type { Display } from "$lib/ui";
  import { capitalize } from "$lib/utils/misc";
  import { DateFormatter, getLocalTimeZone } from "@internationalized/date";
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

  const timeFormatter = new DateFormatter(navigator.language || "en", {
    timeZone: getLocalTimeZone(),
    timeStyle: "short",
    dateStyle: undefined,
  });

  const dateFormatter = new DateFormatter(navigator.language || "en", {
    timeZone: getLocalTimeZone(),
    timeStyle: undefined,
    dateStyle: "long",
  });

  let data: ReadOrWritable<Shift[]>;
  let header = true;
  let state: State = GLOBAL_STATE;
  let rowActions = new Map<string, (item: Shift) => void>();
  let filterValue: Writable<string> = writable("");
  let sortKeys: WritableSortKeys = createSortKeysStore([]);
  let hideForId: Record<string, boolean> = {};
  let flatColumns: FlatColumn<Shift, any, string>[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  let className = "";

  let selected: Shift | undefined = undefined;
  let dialogOpen = false;
  let dialogTitle = "Edit Person";
  let columnInitializers: ColumnInitializer<Shift>[] = [
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
      accessor: (row: Shift) => row.name,
      header: "Name",
      id: "name",
    },
    {
      accessor: (row: Shift) => timeFormatter.format(row.pattern.dtStart.toDate()),
      header: "Start Time",
      id: "timestart",
    },
    {
      accessor: (row: Shift) => `${row.pattern.formattedDuration()} hours`,
      header: "Duration",
      id: "duration",
    },
    {
      accessor: (row: Shift) => dateFormatter.format(row.pattern.dtStart.toDate()),
      header: "Start Date",
      id: "datestart",
    },
    {
      accessor: (row: Shift) => capitalize(row.pattern.toText()),
      header: "Recurrence",
      id: "recurrence",
    },
    {
      accessor: (row: Shift) => Array.from(row.tasks.values()),
      cell: (cell) => createRender(ProfilesList, { items: cell.value, placeholder: "No Tasks" }),
      header: "Tasks in Shift",
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
    ["Edit", (item: Shift) => rowClick(item)],
    ["Delete", (item: Shift) => item.delete()],
  ]);

  function rowClick(item: Shift) {
    dialogTitle = "Edit Skill";
    selected = item;
    dialogOpen = true;
  }

  function newShift() {
    dialogTitle = "Create new Skill";
    selected = new Shift({}, state);
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
          on:click={newShift}
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
