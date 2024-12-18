<script lang="ts" generics="T extends Base">
  import * as Dialog from "$lib/components/dialog";
  import { state as GLOBAL_STATE } from "$lib/model";
  import { Assignment, Base, Location, Person, Shift, Skill, Task } from "$lib/model/core";
  import { Button } from "../button";
  import { DatePicker } from "../date-picker";
  import ImagePicker from "../image-picker/image-picker.svelte";
  import { Input } from "../input";
  import { Label } from "../label";
  import RecurrenceOptionsEdit from "../recurrence/recurrence_options_edit.svelte";
  import { SelectorMany } from "../selector";
  import { Textarea } from "../textarea";
  import TimePicker from "../time-picker/time-picker.svelte";
  import EditLocation from "./edit-location.svelte";

  export let item: T | undefined;
  export let title = "Edit";
  export let open = false;
  export let state = GLOBAL_STATE;

  $: skills = item?.state?.skills || state.skills;
  $: locations = item?.state?.locations || state.locations;
  // $: tasks = item?.state?.tasks || state.tasks;
  // $: people = item?.state?.people || state.people;
  // $: shifts = item?.state?.shifts || state.shifts;
  // $: assignments = item?.state?.assignments || state.assignments;

  function handleSubmit() {
    if (item) {
      item.put();
    }
    open = false;
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger>
    <slot />
  </Dialog.Trigger>
  <Dialog.Content class="max-w-2xl p-4">
    <Dialog.Header>
      <Dialog.Title class="text-xl font-semibold">{title}</Dialog.Title>
      <Dialog.Description>
        Click save to apply changes. Press ESC or close the dialog to cancel.
      </Dialog.Description>
    </Dialog.Header>
    {#if item}
      <div class="mb-4 mt-4 flex h-full max-h-[60vh] w-full flex-col gap-6 overflow-y-scroll p-1">
        {#if item instanceof Person || item instanceof Skill || item instanceof Task || item instanceof Location || item instanceof Shift}
          <div class="flex w-full flex-row items-center justify-between gap-8">
            <ImagePicker bind:item size="xl" />
            <div class="flex h-full w-full flex-col gap-2">
              <div class="flex w-full flex-col gap-1.5">
                <Label class="font-semibold" for="name">Name</Label>
                <Input bind:value={item.name} id="name" placeholder="Name" type="text" />
              </div>
            </div>
          </div>
          <div class="flex w-full flex-col gap-1.5">
            <Label class="font-semibold" for="description">Description</Label>
            <Textarea
              bind:value={item.description}
              id="description"
              placeholder="Enter an optional description"
            />
          </div>
        {/if}
        {#if item instanceof Person}
          <div class="flex w-full flex-col gap-1.5">
            <Label class="font-semibold" for="birthday">Date of Birth</Label>
            <DatePicker id="birthday" class="w-full" bind:value={item.birthday} />
          </div>
          <div class="flex w-full flex-col gap-1.5">
            <Label class="font-semibold" for="skills">Skills</Label>
            <SelectorMany id="skills" bind:value={item.skills} options={$skills} />
          </div>
        {:else if item instanceof Task}
          <div class="flex w-full flex-col gap-1.5">
            <Label class="font-semibold" for="skills">Required Skills</Label>
            <SelectorMany id="skills" bind:value={item.skills} options={$skills} />
          </div>
        {:else if item instanceof Location}
          <EditLocation {item} locations={$locations} />
        {:else if item instanceof Assignment}
          TODO: Assignment UI
        {:else if item instanceof Shift}
          <div class="flex w-full flex-col gap-1.5">
            <Label class="font-semibold" for="duration">Duration</Label>
            <div class="flex flex-row items-center gap-2">
              <TimePicker id="duration" bind:value={item.pattern.duration} />
              hours
            </div>
          </div>
          <RecurrenceOptionsEdit bind:value={item.pattern.recurrenceOptions} />
        {/if}
      </div>
      <Dialog.Footer>
        <Button on:click={handleSubmit} type="submit">Save changes</Button>
      </Dialog.Footer>
    {:else}
      <div class="flex h-40 w-full items-center justify-center bg-muted">
        <p class="text-lg font-semibold text-muted-foreground">No item selected</p>
      </div>
    {/if}
  </Dialog.Content>
</Dialog.Root>
