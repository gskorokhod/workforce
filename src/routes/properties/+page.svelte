<script lang="ts">
  import PropertiesTable from "$lib/components/property/properties-table.svelte";
  import Templates from "$lib/components/views/templates.svelte";
  import { state } from "$lib/model";

  const data = state.properties;
</script>

<main class="h-full w-full">
  <!-- <PropertiesTable {data} class="h-full w-full shadow-md" /> -->
  <Templates {state} class="bg-card shadow-md" />
</main>
