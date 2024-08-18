<script lang="ts">
  // noinspection ES6UnusedImports
  import * as Card from "$lib/components/ui/card/index.ts";
  import type { Assignment } from "$lib/types";
  import Task from "$lib/components/elements/task/task-card.svelte";
  import { ClockIcon, MapPinIcon } from "lucide-svelte";
  import { capitalize } from "$lib/utils/utils.ts";
  import { fmtDateTime } from "$lib/utils/utils.js";
  import { getLocationForAssignment, getTasksForAssignment } from "$lib/types/assignment.ts";

  let assignment: Assignment;

  export { assignment };
</script>

<Card.Root class="w-full bg-white shadow">
  <Card.Header>
    <Card.Title>{capitalize(assignment.name)}</Card.Title>
    <Card.Description>{assignment.description}</Card.Description>
  </Card.Header>

  <Card.Content class="flex flex-col items-start justify-start gap-3">
    <div class="flex flex-row items-center justify-start gap-2 w-full">
      <ClockIcon />
      {fmtDateTime(assignment.start_date_time)} - {fmtDateTime(assignment.end_date_time)}
    </div>
    <div class="flex flex-row items-center justify-start gap-2 w-full">
      <MapPinIcon />
      {getLocationForAssignment(assignment)?.name}
    </div>
    <div class="flex flex-col items-stretch justify-start gap-3 w-full mt-4">
      {#each getTasksForAssignment(assignment) as task}
        <Task task={task} />
      {/each}
    </div>
  </Card.Content>
</Card.Root>