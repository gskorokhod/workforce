<script lang="ts">
  import { Shift } from "$lib/model";
  import RecurrenceOptionsEdit from "$lib/components/recurrence/recurrence_options_edit.svelte";
  import TimePicker from "$lib/components/time-picker/time-picker.svelte";
  import * as Select from "$lib/components/ui/select";
  import { Label } from "$lib/components/ui/label";
  import { Recurrence } from "$lib/model/temporal";
  import { toRecurrence, toSimplePattern, type SimplePattern } from "$lib/model/core/shift";

  export let item: Shift;

  function mkModeSelect(pattern: Recurrence | SimplePattern) {
    if (pattern instanceof Recurrence) {
      return {
        value: "complex",
        label: "Complex",
      };
    } else {
      return {
        value: "simple",
        label: "Simple",
      };
    }
  }

  const pattern = item.rPattern;
</script>

<div class="flex w-full flex-col gap-1.5">
  <Label class="font-semibold" for="duration">Contracted Duration</Label>
  <div class="flex flex-row items-center gap-2">
    <TimePicker id="duration" bind:value={item.paidDuration} />
    hours
  </div>
</div>
<div class="flex w-full flex-col gap-1.5">
  <span class="text-sm font-semibold">Pattern</span>
  <Select.Root
    selected={mkModeSelect($pattern)}
    onSelectedChange={(sel) => {
      if (!sel) return;
      switch (sel.value) {
        case "simple":
          pattern.update((p) => toSimplePattern(p));
          break;
        case "complex":
          pattern.update((p) => toRecurrence(p, item.state));
          break;
      }
    }}
  >
    <Select.Trigger class="w-[180px]">
      <Select.Value placeholder="Mode" />
    </Select.Trigger>
    <Select.Content>
      <Select.Item value="simple">Simple</Select.Item>
      <Select.Item value="complex">Complex</Select.Item>
    </Select.Content>
  </Select.Root>
</div>
{#if $pattern instanceof Recurrence}
  <RecurrenceOptionsEdit bind:recurrence={$pattern.recurrenceOptions} />
{:else}
  <div class="flex w-full flex-col gap-1.5">
    <Label class="font-semibold" for="start">Start Time</Label>
    <TimePicker id="start" bind:value={$pattern.start} />
  </div>
  <div class="flex w-full flex-col gap-1.5">
    <Label class="font-semibold" for="start">End Time</Label>
    <TimePicker id="start" bind:value={$pattern.end} />
  </div>
  {#key $pattern}
    <p class="text-muted-foreground">
      Lasts {item.describePattern()} from {item.fmtStartTime()} to {item.fmtEndTime()}
    </p>
  {/key}
{/if}
