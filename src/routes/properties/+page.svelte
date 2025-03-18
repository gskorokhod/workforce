<script lang="ts">
  import Templates from "$lib/components/views/templates.svelte";
  import { state } from "$lib/model";
</script>

<main class="h-full w-full">
  <!-- <PropertiesTable {data} class="h-full w-full shadow-md" /> -->
  <Templates {state} class="bg-card shadow-md" />
</main>
