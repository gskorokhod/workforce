<script lang="ts">
  import Combobox from "$lib/components/ui/combobox/combobox.svelte";
  import PeopleList from "$lib/components/elements/person/people-list.svelte";
  import PeopleSelectorList from "$lib/components/elements/person/people-selector-list.svelte";
  import SkillsList from "$lib/components/elements/skill/skills-list.svelte";
  import SkillsSelectorList from "$lib/components/elements/skill/skills-selector-list.svelte";
  import IconPicker from "$lib/components/elements/icon-picker/icon-picker.svelte";
  import TasksList from "$lib/components/elements/task/tasks-list.svelte";
  import ColourPicker from "$lib/components/ui/color-picker/color-picker.svelte";
  import PersonEditDialog from "$lib/components/elements/person/person-edit-dialog.svelte";
  import TaskEditDialog from "$lib/components/elements/task/task-edit-dialog.svelte";
  import SkillEditDialog from "$lib/components/elements/skill/skill-edit-dialog.svelte";
  import LocationEditDialog from "$lib/components/elements/location/location-edit-dialog.svelte";
  import Chip from "$lib/components/ui/chip/chip.svelte";
  import Search from "$lib/components/ui/search/search.svelte";
  import type { ComboboxItem } from "$lib/components/ui/combobox";
  import { employees, tasks } from "$lib/stores.ts";
  import type { PersonProps } from "$lib/types";
  import { skills } from "$lib/stores.ts";
  import { generateLocation, generatePerson, generateSkill, generateTask } from "$lib/utils/dummy_data.ts";
  import { Button } from "$lib/components/ui/button";
  import { type TaskProps } from "$lib/types/task.ts";
  import { GraduationCapIcon, PaletteIcon, XIcon } from "lucide-svelte";
  import { ChipSize, ChipVariant } from "$lib/components/ui/chip";
  import { faker } from "@faker-js/faker";
  import { type Writable, writable } from "svelte/store";
  import type { SkillProps } from "$lib/types/skill.ts";
  import type { LocationProps } from "$lib/types/location.ts";
  import { onMount } from "svelte";

  const schedules: ComboboxItem[] = [
    { label: "Schedule 1", value: "schedule1" },
    { label: "Schedule 2", value: "schedule2" }
  ];

  function getSuggestions(value: string): Promise<string[]> {
    let ans = [
      "Mornington Crescent",
      "Euston",
      "St Pancras",
      "Elephant & Castle",
      "Waterloo",
      "London Bridge",
      "A very long station name that is very long to test the overflow"
    ].filter((s) => s.toLowerCase().includes(value.toLowerCase()));
    console.log(ans);
    return Promise.resolve(ans);
  }

  const task = generateTask();
  let skill = generateSkill();
  let person = generatePerson();
  let personProps = writable(person as PersonProps);
  let taskProps = writable(task as TaskProps);
  let skillProps = writable(skill as SkillProps);
  let color = faker.color.rgb();
  let input = writable("");
  let submitted = writable("");
  let locationProps: Writable<LocationProps> | undefined;

  onMount(async () => {
    const location = await generateLocation();
    locationProps = writable(location);
  });

</script>

<div class="w-full h-dvh bg-gray-50 overflow-y-scroll">
  <main class="w-full flex flex-col gap-6 pl-6 pt-4">
    <h1 class="text-2xl font-semibold">Components playground</h1>
    <section class="w-full flex flex-col gap-3">
      <h2 class="text-xl">Search</h2>
      <p>
        Last input: "{$input}"
      </p>
      <p>
        Last submitted: "{$submitted}"
      </p>
      <Search {getSuggestions} class="w-[250px]" onInput={(s) => input.set(s)} onSubmit={(s) => submitted.set(s)} />
    </section>
    <section class="w-full flex flex-col gap-3">
      <h2 class="text-xl">Chip</h2>
      <Chip>
        <GraduationCapIcon slot="icon" />
      </Chip>
      <Chip>
        <GraduationCapIcon slot="icon" />
        <XIcon slot="hover_icon" />
      </Chip>
      <Chip variant={ChipVariant.outline}>
        <GraduationCapIcon slot="icon" />
        <XIcon slot="hover_icon" />
      </Chip>
      <Chip>
        <GraduationCapIcon slot="icon" />
        Chip content
      </Chip>
      <Chip>
        <GraduationCapIcon slot="icon" />
        <XIcon slot="hover_icon" />
        Hover over me
        <svelte:fragment slot="hover">
          Hello world!
        </svelte:fragment>
      </Chip>
      <Chip variant={ChipVariant.color} {color}>
        <PaletteIcon slot="icon" />
        <XIcon slot="hover_icon" />
        Colour (default)
      </Chip>
      <Chip variant={ChipVariant.colorOutline} {color}>
        <PaletteIcon slot="icon" />
        <XIcon slot="hover_icon" />
        Colour (outline)
      </Chip>
      <Chip variant={ChipVariant.colorSolid} {color}>
        <PaletteIcon slot="icon" />
        <XIcon slot="hover_icon" />
        Colour (solid)
      </Chip>
      <Chip variant={ChipVariant.color} {color}>
        <PaletteIcon slot="icon" />
      </Chip>
      <Chip variant={ChipVariant.colorOutline} {color}>
        <PaletteIcon slot="icon" />
      </Chip>
      <Chip variant={ChipVariant.colorSolid} {color}>
        <PaletteIcon slot="icon" />
      </Chip>
      <Chip variant={ChipVariant.destructive} size={ChipSize.lg}>
        <GraduationCapIcon slot="icon" class="h-7 w-7" />
        <XIcon slot="hover_icon" class="h-7 w-7" />
        Chip content
      </Chip>
      <Chip variant={ChipVariant.outline} size={ChipSize.sm}>
        <GraduationCapIcon slot="icon" class="h-5 w-5" />
        <XIcon slot="hover_icon" class="h-5 w-5" />
        Chip content
      </Chip>

    </section>
    <section class="w-full flex flex-col gap-3">
      <h2 class="text-xl">Combobox</h2>
      <Combobox options={schedules} placeholder="Select schedule..." icon={{ icon: "mdi:calendar" }} />
    </section>
    <section class="w-full flex flex-col gap-3">
      <h2 class="text-xl">Icon Picker</h2>
      <IconPicker />
      <IconPicker bind:icon={skill.icon} />
    </section>
    <section class="w-full flex flex-col gap-3">
      <h2 class="text-xl">Colour Picker</h2>
      <ColourPicker />
    </section>
    <section class="w-full flex flex-col items-start gap-3">
      <h2 class="text-xl">Edit dialogs</h2>
      <PersonEditDialog bind:personProps>
        <Button>
          Edit employee
        </Button>
      </PersonEditDialog>
      <SkillEditDialog bind:skillProps>
        <Button>
          Edit skill
        </Button>
      </SkillEditDialog>
      <TaskEditDialog bind:taskProps>
        <Button>
          Edit task
        </Button>
      </TaskEditDialog>
      {#if locationProps}
        <LocationEditDialog bind:locationProps>
          <Button>
            Edit location
          </Button>
        </LocationEditDialog>
      {/if}
    </section>
    <section class="w-full flex flex-col gap-3">
      <h2 class="text-xl">People list</h2>
      <PeopleList people={$employees} compact={true} />
      <PeopleList people={$employees} compact={true} max={3} />
      <PeopleList people={$employees} compact={false} />
      <PeopleList people={$employees} compact={false} max={3} />
    </section>
    <section class="w-full flex flex-col gap-3">
      <h2 class="text-xl">People selector list</h2>
      <p>People selector list (compact)</p>
      <PeopleSelectorList people_uuids={task.people_uuids} min_people={task.min_people} max_people={task.max_people}
                          compact={true} />
      <p>People selector list (full)</p>
      <PeopleSelectorList people_uuids={task.people_uuids} min_people={task.min_people} max_people={task.max_people} />
    </section>
    <section class="w-full flex flex-col gap-3">
      <h2 class="text-xl">Skills</h2>
      <SkillsList skills={$skills} />
      <SkillsList skills={$skills} compact={false} />
      <SkillsSelectorList />
      <SkillsSelectorList n_skills={3} />
      <SkillsSelectorList compact={false} />
      <SkillsSelectorList n_skills={3} compact={false} />
    </section>
    <section class="w-full flex flex-col gap-3">
      <h2 class="text-xl">Task lists</h2>
      <TasksList tasks={$tasks} />
      <TasksList tasks={$tasks} compact={false} />
    </section>
  </main>
</div>