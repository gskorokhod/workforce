<script lang="ts">
  import LocationDataTable from "$lib/components/data-table/location-data-table.svelte";
  import { state } from "$lib/model";

  const locations = state.locations;
</script>

<main class="h-full w-full">
  <LocationDataTable data={locations} class="h-full w-full" mapClass="w-full h-[50%]" />
</main>
