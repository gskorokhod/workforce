<script lang="ts">
  import TaskDataTable from "$lib/components/ui/data-table/task-data-table.svelte";
  import { state } from "$lib/backend";

  const tasks = state.tasks;
</script>

<main class="h-full w-full">
  <TaskDataTable data={tasks} class="h-full w-full" />
</main>
