<script lang="ts">
  import LocationDataTable from "$lib/components/ui/data-table/location-data-table.svelte";
  import { state } from "$lib/backend";

  const locations = state.locations;
</script>

<main class="h-full w-full">
  <LocationDataTable data={locations} class="h-full w-full" mapClass="w-full h-[50%]" />
</main>
