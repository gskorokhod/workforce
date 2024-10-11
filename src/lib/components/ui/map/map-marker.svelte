<script lang="ts">
  import { Location } from "$lib/backend/core";
  import { Icon } from "$lib/backend/ui";
  import { Geopoint, Address, type LngLat } from "$lib/backend/geocoding";
  import { debounce } from "$lib/utils/utils.ts";
  import { MapPinIcon } from "lucide-svelte";
  import { Marker, type MarkerClickInfo, Popup } from "svelte-maplibre";
  import ProfilePicture from "../profile-picture/profile-picture.svelte";
  import ProfileTooltip from "../profile-picture/profile-tooltip.svelte";

  export let location: Location | Geopoint;
  export let draggable: boolean = false;
  export let disabled: boolean = false;
  export let debounceDelay: number = 300;
  export let onDrag: (point: Geopoint) => void = () => {};
  export let onClick: (location: Location | Geopoint) => void = () => {};
  let className: string = "";

  const defaultIcon = Icon.fromString("lucide:map-pin");
  $: coordinates = location instanceof Location ? location.point?.coords : location.coords;
  $: display =
    location instanceof Geopoint
      ? {
          name: `Point: (${formatCoords(location.coords)})`,
          icon: defaultIcon,
          description: location.address?.format()
        }
      : location;

  function formatCoords(coords: LngLat): string {
    return `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`;
  }

  const handleDrag = debounce((e) => {
    const event = e as CustomEvent<MarkerClickInfo>;
    const coords = event.detail.lngLat;
    if (location instanceof Location) {
      if (location.point) {
        location.point.updateCoords(coords).then(() => {
          onDrag(location.point!);
        });
      } else {
        Geopoint.fromCoords(coords).then((point) => {
          location.point = point;
          onDrag(location.point!);
        });
      }
    } else if (location instanceof Geopoint) {
      location.updateCoords(coords).then(() => onDrag(location));
    }
  }, debounceDelay);

  export { className as class };
</script>

{#if coordinates}
  <Marker
    class={className}
    draggable={draggable && !disabled}
    lngLat={coordinates}
    on:drag={handleDrag}
    on:click={() => onClick(location)}
  >
    <div class="group relative h-8 w-8 {disabled && 'opacity-50'}">
      <ProfilePicture item={display} {defaultIcon} />
    </div>

    <Popup offset={[0, -25]} openOn="hover">
      <span class="text-md">{display.name}</span>
    </Popup>
  </Marker>
{/if}
