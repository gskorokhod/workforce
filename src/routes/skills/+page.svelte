<script lang="ts">
  import SkillDataTable from "$lib/components/data-table/skill-data-table.svelte";
  import { state } from "$lib/model";

  const skills = state.skills;
</script>

<main class="h-full w-full">
  <SkillDataTable data={skills} class="h-full w-full" />
</main>
