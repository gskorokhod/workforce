<script lang="ts">
  import { AssignmentPattern } from "$lib/model";
  import RecurrenceOptionsEdit from "$lib/components/recurrence/recurrence_options_edit.svelte";
  import * as Select from "$lib/components/ui/select";
  import { Selector } from "../selector";
  import Separator from "../ui/separator/separator.svelte";
  import Checkbox from "../ui/checkbox/checkbox.svelte";
  import Label from "../ui/label/label.svelte";
  import { uuidOf } from "$lib/model/core/misc";

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
  const _shifts = item.state._shifts;

  $: shift = item.params.shift ? $_shifts.get(uuidOf(item.params.shift)) : undefined;
</script>

<div class="gap- flex w-full flex-row gap-8">
  <div class="flex flex-col gap-5">
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
    <div class="flex w-full flex-col gap-1.5">
      <div class="flex w-full space-x-2">
        <Checkbox
          id="preference"
          checked={item.params.preference === "required"}
          onCheckedChange={(value) => (item.params.preference = value ? "required" : "preferred")}
        />
        <Label
          for="preference"
          class="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >"Hard" assignment</Label
        >
      </div>
      <p class="text-sm text-muted-foreground">
        {item.person?.name}
        {#if item.params.preference === "required"}
          {#if item.params.type === "DAY_OFF"}
            cannot work
          {:else if shift}
            must be assigned to {shift.name}
            {shift.name.toLowerCase().endsWith("shift") ? "" : "Shift"}
          {/if}
        {:else if item.params.type === "DAY_OFF"}
          would prefer to take a day off
        {:else if shift}
          would prefer to work {shift.name}
          {shift.name.toLowerCase().endsWith("shift") ? "" : "Shift"}
        {/if}
        on these dates
      </p>
    </div>
  </div>
  <Separator orientation="vertical" />
  <div class="flex flex-col gap-6" style="padding-top: 0.29rem;">
    <RecurrenceOptionsEdit bind:recurrence={item.pattern.recurrenceOptions} />
  </div>
</div>
