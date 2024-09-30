<script lang="ts">
  import { Location, State } from "$lib/model";
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
  import { Map as MapComponent } from "../map";
  import { TableHeader, ColumnHideSelector } from "./lib";
  import type { Geopoint } from "$lib/model/geocoding";

  let data: ReadOrWritable<Location[]>;
  let header: boolean = true;
  let state: State = GLOBAL_STATE;
  let rowActions: Map<string, (item: Location) => void> = new Map();
  let filterValue: Writable<string> = writable("");
  let sortKeys: WritableSortKeys = createSortKeysStore([]);
  let hideForId: { [key: string]: boolean } = {};
  let flatColumns: FlatColumn<Location, AnyPlugins, string>[];
  let className: string = "";

  let selected: Location | undefined = undefined;
  let dialogOpen: boolean = false;
  let dialogTitle: string = "Edit Person";
  let columnInitializers: ColumnInitializer<Location>[] = [
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
      accessor: (row: Location) => row.name,
      header: "Name",
      id: "name"
    },
    {
      accessor: (row: Location) =>
        row.point?.address.format(["street", "settlement", "country", "postcode"]) || "No Address",
      header: "Address",
      id: "address"
    },
    {
      accessor: (row: Location) =>
        `${row.min.people > 0 ? row.min.people + " - " : ""}${row.max.people} People`,
      header: "Capacity",
      id: "capacity"
    }
  ];

  let actions = new Map([
    ...rowActions,
    ["Edit", (item: Location) => rowClick(item)],
    ["Delete", (item: Location) => item.delete()]
  ]);

  function rowClick(item: Location) {
    dialogTitle = "Edit Location";
    selected = item;
    dialogOpen = true;
  }

  function markerClick(item: Geopoint | Location) {
    if (item instanceof Location) {
      rowClick(item);
    }
  }

  function newLocation() {
    dialogTitle = "Create new Location";
    selected = new Location({}, state);
    dialogOpen = true;
  }

  export { data, actions, header, state, className as class };
</script>

<div class="flex h-max w-max flex-col items-start justify-start overflow-y-scroll {className}">
  {#if header}
    <MapComponent
      locations={$data}
      class="aspect-auto h-[300px] w-full"
      onMarkerClick={markerClick}
    />
  {/if}
  <div class="mt-4 flex h-max w-full flex-col items-start justify-start overflow-y-scroll">
    {#if header}
      <TableHeader sticky={true}>
        <svelte:fragment slot="start">
          <Button
            class="text-muted-foreground hover:text-accent-foreground"
            on:click={newLocation}
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
</div>
<EditDialog item={selected} bind:open={dialogOpen} title={dialogTitle} />
