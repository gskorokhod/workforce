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
  import { Textarea } from "$lib/components/ui/textarea";

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
    </Dialog.Header>
    <div class="flex flex-col w-full h-full gap-6 mt-2 mb-4 p-1 overflow-y-scroll max-h-[400px]">
      <div class="flex flex-row gap-6 items-center justify-start">
        <div class="pt-6">
          <IconPicker bind:icon={$skillProps.icon} />
        </div>
        <div class="w-full">
          <Label for="employee_name" class="font-semibold mb-0.5">Name</Label>
          <Input type="text" id="employee_name" placeholder="Name" bind:value={$skillProps.name} />
        </div>
      </div>
      <div class="grid w-full gap-1.5">
        <Label for="description" class="font-semibold mb-0.5">Description</Label>
        <Textarea placeholder="Type a description here" id="description" bind:value={$skillProps.description} />
      </div>
    </div>
    <Dialog.Footer>
      <Button type="submit" on:click={handleSubmit}>Save changes</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>