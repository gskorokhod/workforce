<script lang="ts">
  import TopBar from "$lib/components/elements/top-bar/top_bar.svelte";
  import Search from "$lib/components/ui/search/search.svelte";
  import ColumnHideSelector from "$lib/components/elements/data-tables/lib/column-hide-selector.svelte";
  import LocationEditDialog from "$lib/components/elements/location/location-edit-dialog.svelte";
  import LocationsDataTable from "$lib/components/elements/data-tables/locations-data-table.svelte";
  import { FlatColumn } from "svelte-headless-table";
  import type { Location } from "$lib/types";
  import { deleteLocation, locations } from "$lib/stores.ts";
  import { writable, type Writable } from "svelte/store";
  import { createSortKeysStore, type WritableSortKeys } from "svelte-headless-table/plugins";
  import type { AnyPlugins } from "svelte-headless-table/plugins";
  import { Button } from "$lib/components/ui/button";
  import { PlusIcon } from "lucide-svelte";
  import { createLocation, defaultLocationProps, type LocationProps } from "$lib/types/location.ts";
  import { getCentrePoint } from "$lib/utils/utils.ts";

  let data: Writable<Location[]> = locations;
  let filterValue: Writable<string> = writable("");
  let sortKeys: WritableSortKeys = createSortKeysStore([]);
  let flatColumns: FlatColumn<Location, AnyPlugins, string>[];
  let hideForId: { [key: string]: boolean } = {};
  let className: string = "";

  let open: boolean = false;
  let locationUUID: string | undefined = undefined;
  let locationProps: Writable<LocationProps> = writable(defaultLocation());

  $: otherLocations = $data.filter((l) => l.uuid !== locationUUID);

  function defaultLocation(): LocationProps {
    return {
      ...defaultLocationProps(),
      coordinates: getCentrePoint($locations.map((l) => l.coordinates)) ?? [0, 0]
    };
  }

  function handleEdit(l: Location) {
    locationUUID = l.uuid;
    locationProps.set(l as LocationProps);
    open = true;
  }

  function handleDelete(l: Location) {
    deleteLocation(l);
  }

  function onSubmit(props: LocationProps) {
    locations.update((locList) => {
      if (locationUUID !== undefined) {
        const index = locList.findIndex((l) => l.uuid === locationUUID);
        if (index !== -1) {
          console.log("Updating index: ", index);
          const p = locList[index];
          locList[index] = {
            ...p,
            ...props
          };
          console.log(locList[index]);
          return locList;
        }
      }

      let newLocation = createLocation(props);
      locList.push(newLocation);
      return locList;
    });

    locationProps.set(defaultLocation());
    locationUUID = undefined;
    open = false;
  }

  function handleAdd() {
    locationProps.set(defaultLocation());
    locationUUID = undefined;
    open = true;
  }

  const actions: Map<string, (l: Location) => void> = new Map([
    ["Edit", handleEdit],
    ["Delete", handleDelete]
  ]);

  export { data, className as class };
</script>

<LocationEditDialog bind:locationProps bind:open {onSubmit} {otherLocations} />
<div class="h-full w-full flex flex-col items-start justify-start overflow-y-scroll {className}">
  <TopBar sticky={true}>
    <svelte:fragment slot="start">
      <Button size="icon_xl" variant="ghost" on:click={handleAdd}
              class="text-muted-foreground hover:text-accent-foreground">
        <PlusIcon />
      </Button>
      <slot name="start" />
    </svelte:fragment>

    <svelte:fragment slot="middle">
      <slot name="middle" />
    </svelte:fragment>

    <svelte:fragment slot="end">
      <ColumnHideSelector {flatColumns} bind:hideForId />
      <Search onInput={(s) => filterValue.set(s)} />
    </svelte:fragment>
  </TopBar>
  <LocationsDataTable {data} {actions} bind:filterValue bind:sortKeys bind:hideForId bind:flatColumns class="w-full" />
</div>