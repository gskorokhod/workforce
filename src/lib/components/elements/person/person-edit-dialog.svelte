<!--suppress ES6UnusedImports -->
<script lang="ts">
  import type { PersonProps } from "$lib/types";
  import type { Writable } from "svelte/store";

  import SkillsSelectorList from "$lib/components/elements/skill/skills-selector-list.svelte";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { DatePicker } from "$lib/components/ui/date-picker";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { getInitials, toCalendarDate } from "$lib/utils/utils.ts";
  import { getLocalTimeZone } from "@internationalized/date";

  let open: boolean = false;
  let personProps: Writable<PersonProps>;
  let onSubmit: (p: PersonProps) => void = () => {};

  const handleSubmit = () => {
    onSubmit($personProps);
    open = false;
  };

  export { onSubmit,open, personProps };
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger>
    <slot />
  </Dialog.Trigger>
  <Dialog.Content class="p-4">
    <Dialog.Header>
      <Dialog.Title class="text-xl font-semibold">Edit Employee Data</Dialog.Title>
      <Dialog.Description>
        Make changes to the employee profile here. Click save when you're done.
      </Dialog.Description>
    </Dialog.Header>
    <div class="mb-4 mt-4 flex h-full max-h-[400px] w-full flex-col gap-6 overflow-y-scroll p-1">
      <div class="flex w-full flex-row items-center justify-between gap-8">
        <Avatar.Root class="h-28 w-28">
          <Avatar.Image alt={$personProps.name} src={$personProps.image_url} />
          <Avatar.Fallback>{getInitials($personProps.name)}</Avatar.Fallback>
        </Avatar.Root>
        <div class="flex h-full w-full flex-col gap-2">
          <div>
            <Label class="mb-0.5 font-semibold" for="employee_name">Name</Label>
            <Input
              bind:value={$personProps.name}
              id="employee_name"
              placeholder="Name"
              type="text"
            />
          </div>
          <div>
            <Label class="mb-0.5 font-semibold" for="employee_job_title">Job Title</Label>
            <Input
              bind:value={$personProps.job_title}
              id="employee_job_title"
              placeholder="Job Title"
              type="text"
            />
          </div>
        </div>
      </div>
      <div>
        <span class="mb-1.5 block text-sm font-semibold">Date of birth:</span>
        <DatePicker
          class="w-full"
          onChange={(dv) =>
            personProps.update((p) => {
              if (dv === undefined) return p;
              return {
                ...p,
                birthday: dv.toDate(getLocalTimeZone())
              };
            })}
          value={toCalendarDate($personProps.birthday)}
        />
      </div>
      <div>
        <span class="block text-sm font-semibold">Skills:</span>
        <SkillsSelectorList
          bind:skill_uuids={$personProps.skill_uuids}
          class="mt-2 w-full"
          compact={false}
        />
      </div>
    </div>
    <Dialog.Footer>
      <Button on:click={handleSubmit} type="submit">Save changes</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
