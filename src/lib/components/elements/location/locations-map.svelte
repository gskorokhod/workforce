<script lang="ts">
  import type { Location } from "$lib/types";
  import type { ReadOrWritable } from "svelte-headless-table";

  import LocationMapMarker from "$lib/components/elements/location/location-map-marker.svelte";
  import { locations as locationsStore } from "$lib/stores.ts";
  import { findBoundingBox } from "$lib/utils/utils.ts";
  import { MapLibre } from "svelte-maplibre";

  let locations: ReadOrWritable<Location[]> = locationsStore;
  let className: string = "";

  export { className as class,locations };
</script>

<MapLibre
  bounds={findBoundingBox($locations.map((l) => l.coordinates))}
  class={className}
  standardControls
  style={"https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"}
>
  {#each $locations as location}
    {#if location.coordinates}
      <LocationMapMarker {location} />
    {/if}
  {/each}
</MapLibre>
