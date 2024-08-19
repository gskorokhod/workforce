<!--suppress ES6UnusedImports -->
<script lang="ts">
  import type { SkillProps } from "$lib/types/skill.ts";
  import type { Writable } from "svelte/store";

  import IconPicker from "$lib/components/elements/icon-picker/icon-picker.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Textarea } from "$lib/components/ui/textarea";

  let open: boolean = false;
  let skillProps: Writable<SkillProps>;
  let onSubmit: (p: SkillProps) => void = () => {};

  const handleSubmit = () => {
    onSubmit($skillProps);
    open = false;
  };

  export { onSubmit, open, skillProps };
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger>
    <slot />
  </Dialog.Trigger>
  <Dialog.Content class="p-4">
    <Dialog.Header>
      <Dialog.Title class="text-xl font-semibold">Edit Skill Data</Dialog.Title>
    </Dialog.Header>
    <div class="mb-4 mt-2 flex h-full max-h-[400px] w-full flex-col gap-6 overflow-y-scroll p-1">
      <div class="flex flex-row items-center justify-start gap-6">
        <div class="pt-6">
          <IconPicker bind:icon={$skillProps.icon} />
        </div>
        <div class="w-full">
          <Label class="mb-0.5 font-semibold" for="employee_name">Name</Label>
          <Input bind:value={$skillProps.name} id="employee_name" placeholder="Name" type="text" />
        </div>
      </div>
      <div class="grid w-full gap-1.5">
        <Label class="mb-0.5 font-semibold" for="description">Description</Label>
        <Textarea
          bind:value={$skillProps.description}
          id="description"
          placeholder="Type a description here"
        />
      </div>
    </div>
    <Dialog.Footer>
      <Button on:click={handleSubmit} type="submit">Save changes</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
