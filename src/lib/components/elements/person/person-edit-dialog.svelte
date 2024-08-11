<!--suppress ES6UnusedImports -->
<script lang="ts">
  import {
    Button
  } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import SkillsSelectorList from "$lib/components/elements/skill/skills-selector-list.svelte";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import type { PersonProps } from "$lib/types";
  import { UserCircleIcon } from "lucide-svelte";
  import { getInitials } from "$lib/utils.ts";
  import type { Writable } from "svelte/store";

  let open: boolean = false;
  let personProps: Writable<PersonProps>;
  let onSubmit: (p: PersonProps) => void = () => {
  };

  const handleSubmit = () => {
    onSubmit($personProps);
    open = false;
  };

  export { open, personProps, onSubmit };
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger>
    <slot />
  </Dialog.Trigger>
  <Dialog.Content class="p-4">
    <Dialog.Header>
      <Dialog.Title class="font-semibold text-xl">Edit Employee Data</Dialog.Title>
      <Dialog.Description>
        Make changes to the employee profile here. Click save when you're done.
      </Dialog.Description>
    </Dialog.Header>
    <div class="flex flex-col w-full h-full gap-8 mt-4 mb-4 p-1 overflow-y-scroll max-h-[400px]">
      <div class="flex flex-row justify-between items-center gap-8 w-full">
        {#if $personProps === undefined}
          <UserCircleIcon class="h-28 w-28 text-muted-foreground" />
        {:else}
          <Avatar.Root class="h-28 w-28">
            <Avatar.Image src={$personProps.image_url} alt={$personProps.name} />
            <Avatar.Fallback>{getInitials($personProps.name)}</Avatar.Fallback>
          </Avatar.Root>
        {/if}
        <div class="flex flex-col h-full w-full gap-2">
          <div>
            <Label for="employee_name" class="font-semibold mb-0.5">Name</Label>
            <Input type="text" id="employee_name" placeholder="Name" bind:value={$personProps.name} />
          </div>
          <div>
            <Label for="employee_job_title" class="font-semibold mb-0.5">Job Title</Label>
            <Input type="text" id="employee_job_title" placeholder="Job Title" bind:value={$personProps.job_title} />
          </div>
        </div>
      </div>
      <section>
        <h2 class="text-lg font-semibold">Skills:</h2>
        <SkillsSelectorList bind:skills={$personProps.skills} compact={false} class="mt-2 w-full" />
      </section>
    </div>
    <Dialog.Footer>
      <Button type="submit" on:click={handleSubmit}>Save changes</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>