<script lang="ts">
  import * as Select from "$lib/components/ui/select";
  import * as ToggleGroup from "$lib/components/ui/toggle-group";
  import { type RecurrenceOptions } from "$lib/model/temporal";
  import type { Selected } from "bits-ui";
  import { Frequency, RRule } from "rrule";
  import { Input } from "../input";

  type SupportedFrequency = Frequency.DAILY | Frequency.WEEKLY | Frequency.MONTHLY;
  const WEEKDAYS = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA, RRule.SU];

  export let value: RecurrenceOptions;
  $: byweekday = (value.byweekday || WEEKDAYS).map((day) => day.toString());

  function onFreqChange(val: Selected<SupportedFrequency> | undefined) {
    if (val) {
      value.freq = val.value;
    }
  }

  function onByweekdayChange(val: string[] | undefined) {
    if (!val) {
      return;
    }

    if (value.freq === RRule.DAILY) {
      value = {
        ...value,
        freq: RRule.WEEKLY
      };
    }

    value.byweekday = WEEKDAYS.filter((day) => val.includes(day.toString()));
  }

  function pluralise(unit: string, n?: number) {
    if (!n) return unit;
    return n === 1 ? unit : `${unit}s`;
  }
</script>

<div class="flex flex-col">
  <div class="flex flex-row">
    <Input type="number" bind:value={value.interval} min={1} />
    <Select.Root selected={{value: value.freq}} onSelectedChange={onFreqChange} required>
      <Select.Trigger id="frequency">
        <Select.Value placeholder="Frequency" />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value={RRule.DAILY}>{pluralise("day", value.interval)}</Select.Item>
        <Select.Item value={RRule.WEEKLY}>{pluralise("week", value.interval)}</Select.Item>
        <Select.Item value={RRule.MONTHLY}>{pluralise("month", value.interval)}</Select.Item>
      </Select.Content>
    </Select.Root>
  </div>
  <div>
    <ToggleGroup.Root type="multiple" value={byweekday} onValueChange={onByweekdayChange}>
      {#each WEEKDAYS as weekday}
        <ToggleGroup.Item value={weekday.toString()}>
          {weekday.toString()}
        </ToggleGroup.Item>
      {/each}
    </ToggleGroup.Root>
  </div>
</div>