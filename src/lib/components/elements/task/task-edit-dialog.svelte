<!--suppress ES6UnusedImports -->
<script lang="ts">
  import type { TaskProps } from "$lib/types/task.ts"; import type { Writable } from "svelte/store";

  import IconPicker from "$lib/components/elements/icon-picker/icon-picker.svelte";
  import PeopleSelectorList from "$lib/components/elements/person/people-selector-list.svelte";
  import SkillsSelectorList from "$lib/components/elements/skill/skills-selector-list.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Textarea } from "$lib/components/ui/textarea";

  let open: boolean = false;
  let taskProps: Writable<TaskProps>;
  let onSubmit: (t: TaskProps) => void = () => {};

  const handleSubmit = () => {
    onSubmit($taskProps);
    open = false;
  };

  export { onSubmit,open, taskProps };
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger>
    <slot />
  </Dialog.Trigger>
  <Dialog.Content class="p-4">
    <Dialog.Header>
      <Dialog.Title class="text-xl font-semibold">Edit Task Data</Dialog.Title>
      <Dialog.Description>
        Make changes to the employee profile here. Click save when you're done.
      </Dialog.Description>
    </Dialog.Header>
    <div class="mb-4 mt-4 flex h-full max-h-[400px] w-full flex-col gap-6 overflow-y-scroll p-1">
      <div class="flex flex-row items-center justify-start gap-6">
        <div class="pt-6">
          <IconPicker bind:icon={$taskProps.icon} />
        </div>
        <div class="w-full">
          <Label class="mb-0.5 font-semibold" for="employee_name">Name</Label>
          <Input bind:value={$taskProps.name} id="employee_name" placeholder="Name" type="text" />
        </div>
      </div>
      <div class="flex w-full flex-row items-center justify-start gap-6">
        <div class="grid w-full gap-1.5">
          <Label class="mb-0.5 font-semibold" for="description">Min. People</Label>
          <Input
            bind:value={$taskProps.min_people}
            id="description"
            placeholder="E.g. 0"
            type="number"
          />
        </div>
        <div class="grid w-full gap-1.5">
          <Label class="mb-0.5 font-semibold" for="description">Max. People</Label>
          <Input
            bind:value={$taskProps.max_people}
            id="description"
            placeholder="E.g. 5"
            type="number"
          />
        </div>
      </div>
      <div class="grid w-full gap-1.5">
        <Label class="mb-0.5 font-semibold" for="description">Description</Label>
        <Textarea
          bind:value={$taskProps.description}
          id="description"
          placeholder="Type a description here"
        />
      </div>
      <div>
        <span class="block text-sm font-semibold">Required Skills:</span>
        <SkillsSelectorList
          bind:skill_uuids={$taskProps.required_skill_uuids}
          class="mt-2 w-full"
          compact={false}
        />
      </div>
      <div>
        <span class="mb-2 block text-sm font-semibold">Assigned Employees:</span>
        <PeopleSelectorList
          bind:people_uuids={$taskProps.people_uuids}
          class="mt-2 w-full"
          compact={false}
          max_people={$taskProps.max_people}
          min_people={$taskProps.min_people}
        />
      </div>
    </div>
    <Dialog.Footer>
      <Button on:click={handleSubmit} type="submit">Save changes</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
