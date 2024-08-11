<!--suppress ES6UnusedImports -->
<script lang="ts">
  import {
    Button
  } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import IconPicker from "$lib/components/elements/icon-picker/icon-picker.svelte";
  import type { Writable } from "svelte/store";
  import type { SkillProps } from "$lib/types/skill.ts";

  let open: boolean = false;
  let skillProps: Writable<SkillProps>;
  let onSubmit: (p: SkillProps) => void = () => {
  };

  const handleSubmit = () => {
    onSubmit($skillProps);
    open = false;
  };

  export { open, skillProps, onSubmit };
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger>
    <slot />
  </Dialog.Trigger>
  <Dialog.Content class="p-4">
    <Dialog.Header>
      <Dialog.Title class="font-semibold text-xl">Edit Skill Data</Dialog.Title>
      <Dialog.Description>
        Make changes to the skill record here. Click save when you're done.
      </Dialog.Description>
    </Dialog.Header>
    <div class="flex flex-col w-full h-full gap-8 mt-4 mb-4 p-1 overflow-y-scroll max-h-[400px]">
      <div class="flex flex-row justify-between items-center gap-8 w-full">
        <IconPicker bind:icon={$skillProps.icon} />
        <div class="flex flex-col h-full w-full gap-2">
          <div>
            <Label for="employee_name" class="font-semibold mb-0.5">Name</Label>
            <Input type="text" id="employee_name" placeholder="Name" bind:value={$skillProps.name} />
          </div>
        </div>
      </div>
    </div>
    <Dialog.Footer>
      <Button type="submit" on:click={handleSubmit}>Save changes</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>