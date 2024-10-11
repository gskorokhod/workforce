<script lang="ts">
  import PersonDataTable from "$lib/components/ui/data-table/person-data-table.svelte";
  import { state } from "$lib/backend";

  const people = state.people;
</script>

<main class="h-full w-full">
  <PersonDataTable data={people} class="h-full w-full" />
</main>
