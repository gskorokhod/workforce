<script lang="ts">
  import { Location } from "$lib/model";
  import { Label } from "$lib/components/ui/label";
  import { Search } from "$lib/components/ui/search";
  import { Map, MapMarker } from "$lib/components/ui/map";
  import { Geopoint } from "$lib/model/geocoding";
  import { without } from "$lib/model/utils";
  import { getAddressCompletions } from "$lib/model/geocoding/osm";

  export let item: Location;
  export let locations: Location[];

  let address: string = item.address;

  function onDrag(item: Geopoint) {
    console.log(item);
    address = item.address.format();
  }
</script>

<div class="flex w-full flex-col gap-1.5">
  <Label class="font-semibold" for="address">Address</Label>
  <Search
    value={address}
    getSuggestions={getAddressCompletions}
    onSubmit={(s) =>
      Geopoint.search(s).then((p) => {
        if (item instanceof Location && p) {
          item.point = p[0];
        }
      })}
  />
</div>
<div class="flex w-full flex-col gap-1.5">
  <Label class="font-semibold" for="point">Location</Label>
  <Map locations={without(locations, item)} disabled id="point" class="h-[250px]">
    <MapMarker bind:location={item} draggable {onDrag} />
  </Map>
  {#if !item.point}
    <p>Click on the map to select a location</p>
  {/if}
</div>
