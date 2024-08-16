<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { skills, shifts, employees, locations, constraints, tasks } from "$lib/stores.ts";
  import {
    generateSkills,
    generatePeople,
    generateLocations,
    generateTasks,
    generateConstraints,
    generateShifts
  } from "$lib/utils/dummy_data.ts";

  async function generateDummyData() {
    skills.set(generateSkills(5));
    employees.set(generatePeople(5));
    tasks.set(generateTasks(5));

    const generatedLocations = await generateLocations(5);
    locations.set(generatedLocations);

    constraints.set(generateConstraints(5));

    const generatedShifts = await generateShifts(5);
    shifts.set(generatedShifts);
  }
</script>

<div class="flex flex-col gap-3 pl-6 pt-4">
  <Button on:click={generateDummyData}>
    Generate dummy data
  </Button>
  <Button on:click={() => {
    skills.set([]);
    locations.set([]);
    employees.set([]);
    tasks.set([]);
    shifts.set([]);
    constraints.set([]);
  }}>
    Clear data
  </Button>
</div>