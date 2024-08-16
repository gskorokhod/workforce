<script lang="ts">
  import { Marker, type MarkerClickInfo, Popup } from "svelte-maplibre";
  import { MapPinIcon } from "lucide-svelte";
  import type { Location } from "$lib/types";
  import { debounce } from "$lib/utils/utils.ts";
  import { reverseGeocode } from "$lib/utils/osm.ts";
  import type { LngLat, LocationProps } from "$lib/types/location.ts";

  let location: Location | LocationProps;
  let draggable: boolean = false;
  let disabled: boolean = false;
  let debounceDelay: number = 300;
  let onDrag: (coords: LngLat) => void = () => {
  };
  let className: string = "";

  const handleDrag = debounce((e) => {
    const event = e as CustomEvent<MarkerClickInfo>;
    location.coordinates = event.detail.lngLat;
    reverseGeocode(location.coordinates).then((address) => {
      location.address = address?.display_name ?? "Unknown address";
      onDrag(location.coordinates);
    });
  }, debounceDelay);

  function formatAddress(address: string): string {
    return address.split(",").slice(0, 4).join(",");
  }

  export { location, disabled, draggable, onDrag, className as class };
</script>

<Marker lngLat={location.coordinates} class={className} draggable={draggable && !disabled} on:drag={handleDrag}>
  {#if location.image_url}
    <div class="relative w-10 h-10 group {disabled && 'opacity-50'}">
      <img src={location.image_url} alt={location.name}
           class="absolute top-0 left-0 rounded-full h-10 w-10 outline outline-2 outline-offset-0 outline-muted-foreground shadow cursor-pointer group-hover:outline-3 group-hover:outline-accent-foreground transition-all z-20" />
      <div
        class="absolute -bottom-4 left-1/4 w-0 h-0 border-[10px] border-transparent border-t-muted-foreground group-hover:border-t-accent-foreground z-10"></div>
    </div>
  {:else}
    <MapPinIcon
      class="rounded-full h-10 w-10 p-1 outline-none outline-offset-0 cursor-pointer bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:outline-accent-foreground transition-all {disabled && 'opacity-50'}" />
  {/if}

  <Popup openOn="hover" offset={[0, -25]}>
    <div class="max-w-[250px]">
      <h3 class="font-semibold {disabled && 'text-muted-foreground'}">{location.name}</h3>
      {#if !disabled}
        <p>{formatAddress(location.address)}</p>
      {/if}
    </div>
  </Popup>
</Marker>