<!--suppress ES6UnusedImports -->
<script lang="ts">
  import {
    Button
  } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import IconPicker from "$lib/components/elements/icon-picker/icon-picker.svelte";
  import SkillsSelectorList from "$lib/components/elements/skill/skills-selector-list.svelte";
  import PeopleSelectorList from "$lib/components/elements/person/people-selector-list.svelte";
  import type { Writable } from "svelte/store";
  import { Textarea } from "$lib/components/ui/textarea";
  import type { TaskProps } from "$lib/types/task.ts";

  let open: boolean = false;
  let taskProps: Writable<TaskProps>;
  let onSubmit: (t: TaskProps) => void = () => {
  };

  const handleSubmit = () => {
    onSubmit($taskProps);
    open = false;
  };

  export { open, taskProps, onSubmit };
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger>
    <slot />
  </Dialog.Trigger>
  <Dialog.Content class="p-4">
    <Dialog.Header>
      <Dialog.Title class="font-semibold text-xl">Edit Task Data</Dialog.Title>
      <Dialog.Description>
        Make changes to the employee profile here. Click save when you're done.
      </Dialog.Description>
    </Dialog.Header>
    <div class="flex flex-col w-full h-full gap-6 mt-4 mb-4 p-1 overflow-y-scroll max-h-[400px]">
      <div class="flex flex-row gap-6 items-center justify-start">
        <div class="pt-6">
          <IconPicker bind:icon={$taskProps.icon} />
        </div>
        <div class="w-full">
          <Label for="employee_name" class="font-semibold mb-0.5">Name</Label>
          <Input type="text" id="employee_name" placeholder="Name" bind:value={$taskProps.name} />
        </div>
      </div>
      <div class="w-full flex flex-row items-center justify-start gap-6">
        <div class="grid w-full gap-1.5">
          <Label for="description" class="font-semibold mb-0.5">Min. People</Label>
          <Input placeholder="E.g. 0" id="description" type="number" bind:value={$taskProps.min_people} />
        </div>
        <div class="grid w-full gap-1.5">
          <Label for="description" class="font-semibold mb-0.5">Max. People</Label>
          <Input placeholder="E.g. 5" id="description" type="number" bind:value={$taskProps.max_people} />
        </div>
      </div>
      <div class="grid w-full gap-1.5">
        <Label for="description" class="font-semibold mb-0.5">Description</Label>
        <Textarea placeholder="Type a description here" id="description" bind:value={$taskProps.description} />
      </div>
      <div>
        <span class="block font-semibold text-sm">Required Skills:</span>
        <SkillsSelectorList bind:skill_uuids={$taskProps.required_skill_uuids} compact={false} class="mt-2 w-full" />
      </div>
      <div>
        <span class="block font-semibold text-sm mb-2">Assigned Employees:</span>
        <PeopleSelectorList bind:people_uuids={$taskProps.people_uuids} compact={false}
                            min_people={$taskProps.min_people} max_people={$taskProps.max_people} class="mt-2 w-full" />
      </div>
    </div>
    <Dialog.Footer>
      <Button type="submit" on:click={handleSubmit}>Save changes</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>