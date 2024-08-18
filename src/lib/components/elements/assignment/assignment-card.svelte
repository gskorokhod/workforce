<script lang="ts">
  import type { Assignment } from "$lib/types";

  import Task from "$lib/components/elements/task/task-card.svelte";
  import * as Card from "$lib/components/ui/card/index.ts";
  import { getLocationForAssignment, getTasksForAssignment } from "$lib/types/assignment.ts";
  import { fmtDateTime } from "$lib/utils/utils.js";
  import { capitalize } from "$lib/utils/utils.ts";
  // noinspection ES6UnusedImports
  import { ClockIcon, MapPinIcon } from "lucide-svelte";

  let assignment: Assignment;

  export { assignment };
</script>

<Card.Root class="w-full bg-white shadow">
  <Card.Header>
    <Card.Title>{capitalize(assignment.name)}</Card.Title>
    <Card.Description>{assignment.description}</Card.Description>
  </Card.Header>

  <Card.Content class="flex flex-col items-start justify-start gap-3">
    <div class="flex w-full flex-row items-center justify-start gap-2">
      <ClockIcon />
      {fmtDateTime(assignment.start_date_time)} - {fmtDateTime(assignment.end_date_time)}
    </div>
    <div class="flex w-full flex-row items-center justify-start gap-2">
      <MapPinIcon />
      {getLocationForAssignment(assignment)?.name}
    </div>
    <div class="mt-4 flex w-full flex-col items-stretch justify-start gap-3">
      {#each getTasksForAssignment(assignment) as task}
        <Task {task} />
      {/each}
    </div>
  </Card.Content>
</Card.Root>
