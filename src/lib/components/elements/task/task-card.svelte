<script lang="ts">
  import type { Task } from "$lib/types";

  import PeopleSelectorList from "$lib/components/elements/person/people-selector-list.svelte";
  import SkillsList from "$lib/components/elements/skill/skills-list.svelte";
  import { getRequiredSkillsForTask } from "$lib/types/task.ts";
  import { capitalize } from "$lib/utils/utils.ts";

  let task: Task;
  let compact: boolean = false;

  $: required_skills = getRequiredSkillsForTask(task);

  export { compact, task };
</script>

<div
  class="group/task-card flex w-full flex-col border-0 border-l-4 border-l-accent-foreground bg-accent p-2"
>
  <h3 class="mb-2 ml-1 inline-flex flex-row items-center justify-start gap-2 text-lg font-semibold">
    {capitalize(task.name)}
  </h3>

  {#if !compact}
    <p class="mb-3 ml-1 text-muted-foreground">{task.description}</p>
    {#if required_skills.length > 0}
      <SkillsList class="mb-4" compact={false} skills={required_skills} />
    {/if}
  {/if}

  <PeopleSelectorList
    bind:people_uuids={task.people_uuids}
    class="ml-0.5 mt-3"
    max_people={task.max_people}
    min_people={task.min_people}
  />
</div>
