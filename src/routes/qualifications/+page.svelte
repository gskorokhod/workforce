<script lang="ts">
  import SkillDataTable from "$lib/components/data-table/qualification-data-table.svelte";
  import { state } from "$lib/model";

  const data = state.qualifications;
</script>

<main class="h-full w-full">
  <SkillDataTable {data} class="h-full w-full" />
</main>
