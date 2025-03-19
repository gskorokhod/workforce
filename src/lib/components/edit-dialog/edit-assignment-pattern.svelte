<script lang="ts">
  import { AssignmentPattern } from "$lib/model";
  import RecurrenceOptionsEdit from "$lib/components/recurrence/recurrence_options_edit.svelte";
  import * as Select from "$lib/components/ui/select";
  import { Selector } from "../selector";
  import Separator from "../ui/separator/separator.svelte";

  export let item: AssignmentPattern;

  function mkTypeSelect(pattern: AssignmentPattern) {
    switch (pattern.params.type) {
      case "DAY_OFF":
        return {
          value: "DAY_OFF",
          label: "Day Off",
        };
      case "SHIFT":
        return {
          value: "SHIFT",
          label: "Shift",
        };
    }
  }

  function onTypeChange(sel?: { value: string }) {
    if (!sel) return;
    switch (sel.value) {
      case "DAY_OFF":
        item.params.type = "DAY_OFF";
        break;
      case "SHIFT":
        item.params.type = "SHIFT";
        break;
    }
  }

  const people = item.state.people;
  const shifts = item.state.shifts;
</script>

<div class="gap- flex w-full flex-row gap-8">
  <div class="flex flex-col gap-4">
    <div class="flex w-full flex-col gap-1.5">
      <span class="text-sm font-semibold">Assignment Type</span>
      <Select.Root selected={mkTypeSelect(item)} onSelectedChange={onTypeChange}>
        <Select.Trigger class="max-w-48">
          <Select.Value placeholder="Select an assignment type" />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="DAY_OFF">Day Off</Select.Item>
          <Select.Item value="SHIFT">Shift</Select.Item>
        </Select.Content>
      </Select.Root>
    </div>
    <div class="flex w-full flex-col gap-1.5">
      <span class="text-sm font-semibold">Person</span>
      <Selector bind:value={item.person} options={$people} allowUnselect={false} variant="full" />
    </div>
    {#if item.params.type === "SHIFT"}
      <div class="flex w-full flex-col gap-1.5">
        <span class="text-sm font-semibold">Shift</span>
        <Selector bind:value={item.shift} options={$shifts} allowUnselect={false} variant="full" />
      </div>
    {/if}
  </div>
  <Separator orientation="vertical" />
  <div class="flex flex-col gap-6" style="padding-top: 0.29rem;">
    <RecurrenceOptionsEdit bind:recurrence={item.pattern.recurrenceOptions} />
  </div>
</div>
