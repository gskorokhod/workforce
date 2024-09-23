<script lang="ts">
  import type { ComboboxItem } from "$lib/components/ui/combobox";

  import { Button } from "$lib/components/ui/button";
  import Chip from "$lib/components/ui/chip/chip.svelte";
  import Combobox from "$lib/components/ui/combobox/combobox.svelte";
  import EditDialog from "$lib/components/ui/edit-dialog/edit-dialog.svelte";
  import IconPicker from "$lib/components/ui/image-picker/icon-picker.svelte";
  import ImagePicker from "$lib/components/ui/image-picker/image-picker.svelte";
  import { Profile } from "$lib/components/ui/profile-picture";
  import Search from "$lib/components/ui/search/search.svelte";
  import { Selector } from "$lib/components/ui/selector";
  import SelectorMany from "$lib/components/ui/selector/selector-many.svelte";
  import { populateState } from "$lib/dummy-data";
  import { State } from "$lib/model";
  import { Icon, type Display } from "$lib/model/ui";
  import { faker } from "@faker-js/faker";
  import { GraduationCapIcon, XIcon } from "lucide-svelte";

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

  let icon: Icon = Icon.fromString("lucide:calendar");
  let dummyDisplay: Display = {
    name: "John Doe",
    icon: Icon.fromString("lucide:user"),
    avatar: new URL(faker.image.avatar())
  };
  let dummyState: State = new State("dummy_state");
  let people = dummyState.people;
  let skills = dummyState.skills;
  let tasks = dummyState.tasks;
</script>

<div class="h-dvh w-full overflow-y-scroll bg-gray-50">
  <Button on:click={() => populateState(dummyState)}>Populate</Button>
  <main class="flex w-full flex-col gap-6 pl-6 pt-4">
    <h1 class="text-2xl font-semibold">Components playground</h1>
    <section class="flex w-full flex-col gap-3">
      <h2 class="text-xl">Search</h2>
      <Search class="w-[250px]" {getSuggestions} />
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
      <Chip variant="outline">
        <GraduationCapIcon slot="icon" />
        <XIcon slot="hover_icon" />
      </Chip>
      <Chip>
        <GraduationCapIcon slot="icon" />
        Chip content
      </Chip>
    </section>
    <section class="flex w-full flex-col gap-3">
      <h2 class="text-xl">Combobox</h2>
      <Combobox
        icon={Icon.fromString("lucide:calendar")}
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
      <h2 class="text-xl">Image Picker</h2>
      <ImagePicker item={dummyDisplay} />
    </section>
    <section class="flex w-full flex-col gap-3">
      <h2 class="text-xl">Profile</h2>
      <Profile item={$people[0]} placeholder="Select person..." />
      <Profile variant="full" item={$people[0]} placeholder="Select person..." />
      <Profile variant="text" item={$people[0]} placeholder="Select person..." />
      <Profile item={$skills[0]} placeholder="Select skill..." />
    </section>
    <section class="flex w-full flex-col gap-3">
      <h2 class="text-xl">Selector (One)</h2>
      <h3 class="text-lg">Default</h3>
      <Selector value={$people[0]} options={$people} />
      <Selector value={$skills[0]} options={$skills} />
      <h3 class="text-lg">Full</h3>
      <Selector value={$people[0]} options={$people} variant="full" />
      <Selector value={$skills[0]} options={$skills} variant="full" />
      <h3 class="text-lg">Compact</h3>
      <Selector value={$people[0]} options={$people} variant="compact" />
      <Selector value={$skills[0]} options={$skills} variant="compact" />
    </section>
    <section class="flex w-full flex-col gap-3">
      <h2 class="text-xl">Selector (Many)</h2>
      <h3 class="text-lg">Default</h3>
      <SelectorMany value={$people.slice(0, 2)} options={$people} />
      <SelectorMany value={$skills.slice(0, 2)} options={$skills} />
      <h3 class="text-lg">Full</h3>
      <SelectorMany value={$people.slice(0, 2)} options={$people} variant="full" />
      <SelectorMany value={$skills.slice(0, 2)} options={$skills} variant="full" />
      <h3 class="text-lg">Compact</h3>
      <SelectorMany value={$people.slice(0, 2)} options={$people} variant="compact" />
      <SelectorMany value={$skills.slice(0, 2)} options={$skills} variant="compact" />
    </section>
    <section>
      <h2 class="mb-1.5 text-xl">Edit Dialog</h2>
      <EditDialog item={$people[0]} title="Edit Person" />
      <EditDialog item={$skills[0]} title="Edit Skill" />
      <EditDialog item={$tasks[0]} title="Edit Task" />
    </section>
  </main>
</div>
