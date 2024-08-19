<script lang="ts">
  import type { ComboboxItem } from "$lib/components/ui/combobox";

  import IconPicker from "$lib/components/elements/icon-picker/icon-picker.svelte";
  import LocationEditDialog from "$lib/components/elements/location/location-edit-dialog.svelte";
  import PeopleList from "$lib/components/elements/person/people-list.svelte";
  import PeopleSelectorList from "$lib/components/elements/person/people-selector-list.svelte";
  import PersonEditDialog from "$lib/components/elements/person/person-edit-dialog.svelte";
  import SkillEditDialog from "$lib/components/elements/skill/skill-edit-dialog.svelte";
  import SkillsList from "$lib/components/elements/skill/skills-list.svelte";
  import SkillsSelectorList from "$lib/components/elements/skill/skills-selector-list.svelte";
  import TaskEditDialog from "$lib/components/elements/task/task-edit-dialog.svelte";
  import TasksList from "$lib/components/elements/task/tasks-list.svelte";
  import { Button } from "$lib/components/ui/button";
  import { ChipSize, ChipVariant } from "$lib/components/ui/chip";
  import Chip from "$lib/components/ui/chip/chip.svelte";
  import ColourPicker from "$lib/components/ui/color-picker/color-picker.svelte";
  import Combobox from "$lib/components/ui/combobox/combobox.svelte";
  import Search from "$lib/components/ui/search/search.svelte";
  import { employees, locations, skills, tasks } from "$lib/stores.ts";
  import {
    defaultLocationProps,
    defaultPersonProps,
    defaultSkillProps,
    defaultTaskProps,
    type IconType,
    type LocationProps,
    type PersonProps,
    type SkillProps,
    type TaskProps
  } from "$lib/types";
  import { generateIcon } from "$lib/utils/dummy_data.ts";
  import { sampleOne } from "$lib/utils/utils.ts";
  import { faker } from "@faker-js/faker";
  import { GraduationCapIcon, PaletteIcon, XIcon } from "lucide-svelte";
  import { type Writable, writable } from "svelte/store";

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

  let personProps: Writable<PersonProps> = writable(defaultPersonProps());
  let skillProps: Writable<SkillProps> = writable(defaultSkillProps());
  let taskProps: Writable<TaskProps> = writable(defaultTaskProps());
  let locationProps: Writable<LocationProps> = writable(defaultLocationProps());

  let input: Writable<string> = writable("");
  let submitted: Writable<string> = writable("");
  let color: string = faker.color.rgb();
  let icon: IconType = generateIcon();

  employees.subscribe((value) => {
    personProps.set(sampleOne(value) as PersonProps);
  });

  tasks.subscribe((value) => {
    taskProps.set(sampleOne(value) as TaskProps);
  });

  locations.subscribe((value) => {
    locationProps.set(sampleOne(value) as LocationProps);
  });

  skills.subscribe((value) => {
    skillProps.set(sampleOne(value) as SkillProps);
  });
</script>

<div class="h-dvh w-full overflow-y-scroll bg-gray-50">
  <main class="flex w-full flex-col gap-6 pl-6 pt-4">
    <h1 class="text-2xl font-semibold">Components playground</h1>
    <section class="flex w-full flex-col gap-3">
      <h2 class="text-xl">Search</h2>
      <p>
        Last input: "{$input}"
      </p>
      <p>
        Last submitted: "{$submitted}"
      </p>
      <Search
        class="w-[250px]"
        {getSuggestions}
        onInput={(s) => input.set(s)}
        onSubmit={(s) => submitted.set(s)}
      />
    </section>
    <section class="flex w-full flex-col gap-3">
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
        <svelte:fragment slot="hover">Hello world!</svelte:fragment>
      </Chip>
      <Chip {color} variant={ChipVariant.color}>
        <PaletteIcon slot="icon" />
        <XIcon slot="hover_icon" />
        Colour (default)
      </Chip>
      <Chip {color} variant={ChipVariant.colorOutline}>
        <PaletteIcon slot="icon" />
        <XIcon slot="hover_icon" />
        Colour (outline)
      </Chip>
      <Chip {color} variant={ChipVariant.colorSolid}>
        <PaletteIcon slot="icon" />
        <XIcon slot="hover_icon" />
        Colour (solid)
      </Chip>
      <Chip {color} variant={ChipVariant.color}>
        <PaletteIcon slot="icon" />
      </Chip>
      <Chip {color} variant={ChipVariant.colorOutline}>
        <PaletteIcon slot="icon" />
      </Chip>
      <Chip {color} variant={ChipVariant.colorSolid}>
        <PaletteIcon slot="icon" />
      </Chip>
      <Chip size={ChipSize.lg} variant={ChipVariant.destructive}>
        <GraduationCapIcon class="h-7 w-7" slot="icon" />
        <XIcon class="h-7 w-7" slot="hover_icon" />
        Chip content
      </Chip>
      <Chip size={ChipSize.sm} variant={ChipVariant.outline}>
        <GraduationCapIcon class="h-5 w-5" slot="icon" />
        <XIcon class="h-5 w-5" slot="hover_icon" />
        Chip content
      </Chip>
    </section>
    <section class="flex w-full flex-col gap-3">
      <h2 class="text-xl">Combobox</h2>
      <Combobox
        icon={{ icon: "mdi:calendar" }}
        options={schedules}
        placeholder="Select schedule..."
      />
    </section>
    <section class="flex w-full flex-col gap-3">
      <h2 class="text-xl">Icon Picker</h2>
      <IconPicker />
      <IconPicker bind:icon />
    </section>
    <section class="flex w-full flex-col gap-3">
      <h2 class="text-xl">Colour Picker</h2>
      <ColourPicker />
    </section>
    <section class="flex w-full flex-col items-start gap-3">
      <h2 class="text-xl">Edit dialogs</h2>
      <PersonEditDialog bind:personProps>
        <Button>Edit employee</Button>
      </PersonEditDialog>
      <SkillEditDialog bind:skillProps>
        <Button>Edit skill</Button>
      </SkillEditDialog>
      <TaskEditDialog bind:taskProps>
        <Button>Edit task</Button>
      </TaskEditDialog>
      {#if locationProps}
        <LocationEditDialog bind:locationProps>
          <Button>Edit location</Button>
        </LocationEditDialog>
      {/if}
    </section>
    <section class="flex w-full flex-col gap-3">
      <h2 class="text-xl">People list</h2>
      <PeopleList compact={true} people={$employees} />
      <PeopleList compact={true} max={3} people={$employees} />
      <PeopleList compact={false} people={$employees} />
      <PeopleList compact={false} max={3} people={$employees} />
    </section>
    <section class="flex w-full flex-col gap-3">
      <h2 class="text-xl">People selector list</h2>
      <p>People selector list (compact)</p>
      <PeopleSelectorList
        compact={true}
        max_people={$taskProps.max_people}
        min_people={$taskProps.min_people}
        options={$employees}
        people_uuids={$taskProps.people_uuids}
      />
      <p>People selector list (full)</p>
      <PeopleSelectorList
        max_people={$taskProps.max_people}
        min_people={$taskProps.min_people}
        options={$employees}
        people_uuids={$taskProps.people_uuids}
      />
    </section>
    <section class="flex w-full flex-col gap-3">
      <h2 class="text-xl">Skills</h2>
      <SkillsList skills={$skills} />
      <SkillsList compact={false} skills={$skills} />
      <SkillsSelectorList />
      <SkillsSelectorList n_skills={3} />
      <SkillsSelectorList compact={false} />
      <SkillsSelectorList compact={false} n_skills={3} />
    </section>
    <section class="flex w-full flex-col gap-3">
      <h2 class="text-xl">Task lists</h2>
      <TasksList tasks={$tasks} />
      <TasksList compact={false} tasks={$tasks} />
    </section>
  </main>
</div>
