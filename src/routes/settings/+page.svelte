<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { skills, assignments, employees, locations, constraints, tasks } from "$lib/stores.ts";
  import { type DummyData, type DummyDataGenProps, generateDummyData } from "$lib/utils/dummy_data.ts";

  const COUNTS: DummyDataGenProps = {
    people: 5,
    tasks: 5,
    locations: 5,
    assignments: 5,
    skills: 5,
    constraints: 10
  };

  async function populateStores() {
    const dummyData: DummyData = await generateDummyData(COUNTS);

    skills.set(dummyData.skills);
    locations.set(dummyData.locations);
    employees.set(dummyData.people);
    tasks.set(dummyData.tasks);
    assignments.set(dummyData.assignments);
    constraints.set(dummyData.constraints);
  }

  function clearStores() {
    skills.set([]);
    locations.set([]);
    employees.set([]);
    tasks.set([]);
    assignments.set([]);
    constraints.set([]);
  }
</script>

<div class="flex flex-col gap-3 pl-6 pt-4">
  <Button on:click={populateStores}>
    Generate dummy data
  </Button>
  <Button on:click={clearStores}>
    Clear data
  </Button>
</div>