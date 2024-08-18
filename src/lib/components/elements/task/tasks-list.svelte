<script lang="ts">
  import type { Task } from "$lib/types";

  import TaskBadge from "$lib/components/elements/task/task-badge.svelte";

  let tasks: Task[] = [];
  let placeholder: string = "No tasks";
  let compact: boolean = true;
  let className: string = "";

  export { className as class,compact, tasks };
</script>

{#if tasks.length > 0}
  <div class="flex flex-row flex-wrap items-center justify-start gap-2 {className}">
    {#each tasks as task}
      <TaskBadge {compact} {task} />
    {/each}
  </div>
{:else}
  <div class="text-accent-foreground {className}">{placeholder}</div>
{/if}
