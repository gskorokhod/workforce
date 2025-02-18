<script lang="ts">
  import QualificationDataTable from "$lib/components/data-table/qualification-data-table.svelte";
  import { state } from "$lib/model";

  const data = state.qualifications;
</script>

<main class="h-full w-full">
  <QualificationDataTable {data} class="h-full w-full" />
</main>
