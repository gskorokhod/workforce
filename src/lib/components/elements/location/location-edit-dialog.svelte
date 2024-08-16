<!--suppress ES6UnusedImports -->
<script lang="ts">
  import {
    Button
  } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import Search from "$lib/components/ui/search/search.svelte";
  import LocationMapMarker from "$lib/components/elements/location/location-map-marker.svelte";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import { writable, type Writable } from "svelte/store";
  import type { Location, LocationProps } from "$lib/types/location.ts";
  import { MapLibre } from "svelte-maplibre";
  import { geocode, getAddressCompletions } from "$lib/utils/osm.ts";
  import { locations } from "$lib/stores.ts";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { getInitials } from "$lib/utils/utils.ts";

  let open: boolean = false;
  let otherLocations: Location[] = $locations;
  let locationProps: Writable<LocationProps>;
  let searchInput: Writable<string> = writable("");
  let onSubmit: (p: LocationProps) => void = () => {
  };

  locationProps.subscribe((l) => searchInput.set(l.address));

  function handleSubmit() {
    onSubmit($locationProps);
    open = false;
  }

  function handleSearch(value: string) {
    geocode(value).then((coords) => {
      if (coords) {
        locationProps.update((p) => {
          p.coordinates = coords;
          p.address = value;
          return p;
        });
      }
    });
  }

  export { open, locationProps, otherLocations, onSubmit };
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger>
    <slot />
  </Dialog.Trigger>
  <Dialog.Content class="p-4 max-w-3xl">
    <Dialog.Header>
      <Dialog.Title class="font-semibold text-xl">Edit Location Data</Dialog.Title>
      <Dialog.Description>
        Make changes to the location record here. Click save when you're done.
      </Dialog.Description>
    </Dialog.Header>
    <div class="flex flex-col w-full h-full gap-6 mt-2 mb-6 p-1 overflow-y-scroll max-h-[600px]">
      <div class="flex flex-row w-full gap-6 justify-start items-center">
        <Avatar.Root class="h-16 w-16">
          <Avatar.Image src={$locationProps.image_url} alt={$locationProps.name} />
          <Avatar.Fallback>{getInitials($locationProps.name)}</Avatar.Fallback>
        </Avatar.Root>
        <div class="w-full pb-2">
          <Label for="location_name" class="font-semibold">Name</Label>
          <Input type="text" id="location_name" placeholder="Location Name" bind:value={$locationProps.name}
                 class="mt-1" />
        </div>
      </div>
      <div class="flex flex-col w-full">
        <span class="block font-semibold text-sm mb-1.5">Address</span>
        <Search class="w-full mb-3" getSuggestions={(s) => getAddressCompletions(s, $locationProps.coordinates, ["gb"])}
                onSubmit={handleSearch} bind:searchInput />
        <MapLibre
          style={"https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"}
          zoom={15}
          center={[$locationProps.coordinates[0], $locationProps.coordinates[1]]}
          class="w-full h-[300px]"
        >
          {#each otherLocations as loc}
            <LocationMapMarker location={loc} disabled />
          {/each}
          <LocationMapMarker bind:location={$locationProps} draggable
                             onDrag={() => searchInput.set($locationProps.address)} />
        </MapLibre>
      </div>

    </div>
    <Dialog.Footer>
      <Button type="submit" on:click={handleSubmit}>Save changes</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>