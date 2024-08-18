<!--suppress ES6UnusedImports -->
<script lang="ts">
  import type { Location, LocationProps } from "$lib/types/location.ts";

  import LocationMapMarker from "$lib/components/elements/location/location-map-marker.svelte";
   import * as Avatar from "$lib/components/ui/avatar/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import Search from "$lib/components/ui/search/search.svelte";
  import { locations } from "$lib/stores.ts";
  import { geocode, getAddressCompletions } from "$lib/utils/osm.ts";
  import { getInitials } from "$lib/utils/utils.ts";
  import { type Writable,writable } from "svelte/store";
  import { MapLibre } from "svelte-maplibre";

  let open: boolean = false;
  let otherLocations: Location[] = $locations;
  let locationProps: Writable<LocationProps>;
  let searchInput: Writable<string> = writable("");
  let onSubmit: (p: LocationProps) => void = () => {};

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

  export { locationProps, onSubmit,open, otherLocations };
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger>
    <slot />
  </Dialog.Trigger>
  <Dialog.Content class="max-w-3xl p-4">
    <Dialog.Header>
      <Dialog.Title class="text-xl font-semibold">Edit Location Data</Dialog.Title>
      <Dialog.Description>
        Make changes to the location record here. Click save when you're done.
      </Dialog.Description>
    </Dialog.Header>
    <div class="mb-6 mt-2 flex h-full max-h-[600px] w-full flex-col gap-6 overflow-y-scroll p-1">
      <div class="flex w-full flex-row items-center justify-start gap-6">
        <Avatar.Root class="h-16 w-16">
          <Avatar.Image alt={$locationProps.name} src={$locationProps.image_url} />
          <Avatar.Fallback>{getInitials($locationProps.name)}</Avatar.Fallback>
        </Avatar.Root>
        <div class="w-full pb-2">
          <Label class="font-semibold" for="location_name">Name</Label>
          <Input
            bind:value={$locationProps.name}
            class="mt-1"
            id="location_name"
            placeholder="Location Name"
            type="text"
          />
        </div>
      </div>
      <div class="flex w-full flex-col">
        <span class="mb-1.5 block text-sm font-semibold">Address</span>
        <Search
          bind:searchInput
          class="mb-3 w-full"
          getSuggestions={(s) => getAddressCompletions(s, $locationProps.coordinates, ["gb"])}
          onSubmit={handleSearch}
        />
        <MapLibre
          center={[$locationProps.coordinates[0], $locationProps.coordinates[1]]}
          class="h-[300px] w-full"
          style={"https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"}
          zoom={15}
        >
          {#each otherLocations as loc}
            <LocationMapMarker disabled location={loc} />
          {/each}
          <LocationMapMarker
            bind:location={$locationProps}
            draggable
            onDrag={() => searchInput.set($locationProps.address)}
          />
        </MapLibre>
      </div>
    </div>
    <Dialog.Footer>
      <Button on:click={handleSubmit} type="submit">Save changes</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
