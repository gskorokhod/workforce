<script lang="ts">
  import TaskDataTable from "$lib/components/data-table/task-data-table.svelte";
  import { state } from "$lib/model";

  const tasks = state.tasks;
</script>

<main class="h-full w-full">
  <TaskDataTable data={tasks} class="h-full w-full" />
</main>
