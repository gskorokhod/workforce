<script lang="ts">
  import { MapLibre } from "svelte-maplibre";
  import { locations as locationsStore } from "$lib/stores.ts";
  import { findBoundingBox } from "$lib/utils/utils.ts";
  import LocationMapMarker from "$lib/components/elements/location/location-map-marker.svelte";
  import type { Location } from "$lib/types";
  import type { ReadOrWritable } from "svelte-headless-table";

  let locations: ReadOrWritable<Location[]> = locationsStore;
  let className: string = "";

  export { locations, className as class };
</script>

<MapLibre
  style={"https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"}
  class={className}
  bounds={findBoundingBox($locations.map((l) => l.coordinates))}
  standardControls
>
  {#each $locations as location}
    {#if location.coordinates}
      <LocationMapMarker {location} />
    {/if}
  {/each}
</MapLibre>