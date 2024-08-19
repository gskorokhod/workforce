<script lang="ts">
  import type { Location } from "$lib/types";
  import type { AnyPlugins } from "svelte-headless-table/plugins";

  import ColumnHideSelector from "$lib/components/elements/data-tables/lib/column-hide-selector.svelte";
  import LocationsDataTable from "$lib/components/elements/data-tables/locations-data-table.svelte";
  import LocationEditDialog from "$lib/components/elements/location/location-edit-dialog.svelte";
  import LocationsMap from "$lib/components/elements/location/locations-map.svelte";
  import TopBar from "$lib/components/elements/top-bar/top_bar.svelte";
  import { Button } from "$lib/components/ui/button";
  import Search from "$lib/components/ui/search/search.svelte";
  import { deleteLocation, locations } from "$lib/stores.ts";
  import { createLocation, defaultLocationProps, type LocationProps } from "$lib/types/location.ts";
  import { getCentrePoint } from "$lib/utils/utils.ts";
  import { PlusIcon } from "lucide-svelte";
  import { type Writable, writable } from "svelte/store";
  import { FlatColumn } from "svelte-headless-table";
  import { createSortKeysStore, type WritableSortKeys } from "svelte-headless-table/plugins";

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
    ["Delete", handleDelete],
    ["Edit", handleEdit]
  ]);

  export { className as class, data };
</script>

<div class="flex h-full w-full flex-col items-start justify-start overflow-y-scroll {className}">
  <LocationsMap class="h-[600px] w-full" locations={data} />
  <TopBar sticky={true}>
    <svelte:fragment slot="start">
      <Button
        class="text-muted-foreground hover:text-accent-foreground"
        on:click={handleAdd}
        size="icon_xl"
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
  </TopBar>
  <LocationsDataTable
    {actions}
    bind:filterValue
    bind:flatColumns
    bind:hideForId
    bind:sortKeys
    class="w-full"
    {data}
  />
</div>
<LocationEditDialog bind:locationProps bind:open {onSubmit} {otherLocations} />
