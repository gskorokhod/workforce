<script lang="ts">
  import type { Location } from "$lib/types";
  import type { LngLat, LocationProps } from "$lib/types/location.ts";

  import { reverseGeocode } from "$lib/utils/osm.ts";
  import { debounce } from "$lib/utils/utils.ts";
  import { MapPinIcon } from "lucide-svelte";
  import { Marker, type MarkerClickInfo, Popup } from "svelte-maplibre";

  let location: Location | LocationProps;
  let draggable: boolean = false;
  let disabled: boolean = false;
  let debounceDelay: number = 300;
  let onDrag: (coords: LngLat) => void = () => {};
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

  export { className as class,disabled, draggable, location, onDrag };
</script>

<Marker
  class={className}
  draggable={draggable && !disabled}
  lngLat={location.coordinates}
  on:drag={handleDrag}
>
  {#if location.image_url}
    <div class="group relative h-10 w-10 {disabled && 'opacity-50'}">
      <img
        alt={location.name}
        class="group-hover:outline-3 absolute left-0 top-0 z-20 h-10 w-10 cursor-pointer rounded-full shadow outline outline-2 outline-offset-0 outline-muted-foreground transition-all group-hover:outline-accent-foreground"
        src={location.image_url}
      />
      <div
        class="absolute -bottom-4 left-1/4 z-10 h-0 w-0 border-[10px] border-transparent border-t-muted-foreground group-hover:border-t-accent-foreground"
      ></div>
    </div>
  {:else}
    <MapPinIcon
      class="h-10 w-10 cursor-pointer rounded-full bg-transparent p-1 text-muted-foreground outline-none outline-offset-0 transition-all hover:bg-accent hover:text-accent-foreground hover:outline-accent-foreground {disabled &&
        'opacity-50'}"
    />
  {/if}

  <Popup offset={[0, -25]} openOn="hover">
    <div class="max-w-[250px]">
      <h3 class="font-semibold {disabled && 'text-muted-foreground'}">{location.name}</h3>
      {#if !disabled}
        <p>{formatAddress(location.address)}</p>
      {/if}
    </div>
  </Popup>
</Marker>
