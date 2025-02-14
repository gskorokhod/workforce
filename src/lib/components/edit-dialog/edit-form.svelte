<script lang="ts" generics="T">
  import { DatePicker } from "$lib/components/date-picker";
  import PropertiesInput from "$lib/components/property/properties-input.svelte";
  import RecurrenceOptionsEdit from "$lib/components/recurrence/recurrence_options_edit.svelte";
  import TimePicker from "$lib/components/time-picker/time-picker.svelte";
  import { Label } from "$lib/components/ui/label";
  import { state as GLOBAL_STATE } from "$lib/model";
  import { Assignment, Location, Person, Shift, WithProperties } from "$lib/model/core";
  import { isDisplay } from "$lib/ui";
  import DisplayEditForm from "./display-edit-form.svelte";
  import EditLocation from "./edit-location.svelte";

  export let item: T | undefined;
  export let state = GLOBAL_STATE;
  let className = "";

  const locations = state.locations;
  // const properties = item instanceof WithProperties ? item.properties.rKeys : readable([]);
  // $: tasks = item?.state?.tasks || state.tasks;
  // $: people = item?.state?.people || state.people;
  // $: shifts = item?.state?.shifts || state.shifts;
  // $: assignments = item?.state?.assignments || state.assignments;

  export { className as class };
</script>

<div
  class="mb-4 mt-4 flex h-full max-h-[60vh] w-full flex-col gap-6 overflow-y-scroll p-1 {className}"
>
  {#if isDisplay(item)}
    <DisplayEditForm bind:item />
  {/if}
  {#if item instanceof Person}
    <div class="flex w-full flex-col gap-1.5">
      <Label class="font-semibold" for="birthday">Date of Birth</Label>
      <DatePicker id="birthday" class="w-full" bind:value={item.dob} />
    </div>
  {/if}
  {#if item instanceof WithProperties}
    <PropertiesInput {item} />
  {/if}
  {#if item instanceof Location}
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
    <RecurrenceOptionsEdit bind:recurrence={item.pattern.recurrenceOptions} />
  {/if}
  <slot {item} />
</div>
