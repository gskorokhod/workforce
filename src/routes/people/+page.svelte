<script lang="ts">
  import PersonDataTable from "$lib/components/data-table/person-data-table.svelte";
  import { state } from "$lib/model";

  const people = state.people;
</script>

<main class="h-full w-full">
  <PersonDataTable data={people} class="h-full w-full shadow-md" />
</main>
