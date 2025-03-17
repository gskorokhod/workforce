<script lang="ts">
  import * as Select from "$lib/components/ui/select";
  import * as ToggleGroup from "$lib/components/ui/toggle-group";
  import { type RecurrenceOptions } from "$lib/model/temporal";
  import { fromRecurrenceOptions } from "$lib/model/temporal/options";
  import { type DateValue, getLocalTimeZone, toZoned } from "@internationalized/date";
  import type { Selected } from "bits-ui";
  import { Frequency, RRule, Weekday } from "rrule";
  import { DatePicker } from "../date-picker";
  import { Input } from "../ui/input";
  import { Label } from "../ui/label";
  import TimePicker from "../time-picker/time-picker.svelte";

  type SupportedFrequency = Frequency.DAILY | Frequency.WEEKLY | Frequency.MONTHLY;
  const WEEKDAYS = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA, RRule.SU];
  const FREQUENCIES = new Map<SupportedFrequency, string>([
    [RRule.DAILY, "day"],
    [RRule.WEEKLY, "week"],
    [RRule.MONTHLY, "month"],
  ]);
  const END_OPTIONS = new Map<string, string>([
    ["until", "On"],
    ["count", "After"],
    ["infinite", "Never"],
  ]);

  export let recurrence: Partial<RecurrenceOptions>;
  export let onChange: (recurrence: Partial<RecurrenceOptions>) => void = () => {};
  let prevByweekday: Weekday[] | undefined = undefined;
  let until = recurrence.until || undefined;
  let count = recurrence.count || 1;
  let endVal = recurrence.count ? "count" : recurrence.until ? "until" : "infinite";

  $: freqSelected = {
    value: recurrence.freq,
    label: mkFreqLabel(recurrence.freq, recurrence.interval),
  };
  $: endSelected = { value: endVal, label: END_OPTIONS.get(endVal) || "Never" };
  $: byweekday = (recurrence.byweekday || WEEKDAYS).map((day) => day.toString());
  $: dtstart = recurrence.dtstart;
  $: rrule = new RRule(fromRecurrenceOptions(recurrence));

  function onFreqChange(val?: Selected<SupportedFrequency | undefined>) {
    if (val) {
      const fval = val.value;
      if (!fval) {
        return;
      }

      if (fval === RRule.DAILY && recurrence.byweekday && recurrence.byweekday.length !== 7) {
        prevByweekday = recurrence.byweekday;
        recurrence.byweekday = undefined;
      } else if (fval !== RRule.DAILY && prevByweekday) {
        recurrence.byweekday = prevByweekday;
        prevByweekday = undefined;
      }

      recurrence.freq = fval;
      onChange(recurrence);
    }
  }

  function onByweekdayChange(val: string[] | undefined) {
    if (!val) {
      return;
    }

    if (recurrence.freq === RRule.DAILY) {
      recurrence = {
        ...recurrence,
        freq: RRule.WEEKLY,
        interval: 1,
      };
    }

    const byweekday = WEEKDAYS.filter((day) => val.includes(day.toString()));
    recurrence.byweekday = byweekday;
    onChange(recurrence);
  }

  function onDtstartChange(val: DateValue | undefined) {
    if (!val) return;

    if (recurrence.dtstart) {
      recurrence.dtstart = recurrence.dtstart.set(val);
    } else {
      recurrence.dtstart = toZoned(val, getLocalTimeZone());
    }

    onChange(recurrence);
  }

  function onEndValChange(
    end: string | undefined,
    until: DateValue | undefined,
    count: number | undefined,
  ) {
    if (!end) {
      return;
    }

    endVal = end;
    if (end === "infinite") {
      recurrence.until = undefined;
      recurrence.count = undefined;
    } else if (end === "until") {
      recurrence.until = until;
      recurrence.count = undefined;
    } else if (end === "count") {
      recurrence.count = count;
      recurrence.until = undefined;
    }

    onChange(recurrence);
  }

  function pluralise(unit: string, n?: number | string) {
    const num = typeof n === "string" ? parseInt(n) : n;
    return num === 1 ? unit : `${unit}s`;
  }

  function mkFreqLabel(freq?: SupportedFrequency, n?: number) {
    if (!freq) return "";
    return pluralise(FREQUENCIES.get(freq) || "", n);
  }
</script>

<div class="flex w-full flex-col gap-1.5">
  <Label for="dtstart" class="font-semibold">Starts on</Label>
  <div class="flex flex-row items-center gap-2" id="dtstart">
    <DatePicker class="w-52" value={dtstart} onChange={onDtstartChange} />
    at
    <TimePicker value={dtstart} onChange={onDtstartChange} />
  </div>
</div>
<div class="flex w-full flex-col gap-1.5">
  <Label for="occurs" class="font-semibold">Occurs</Label>
  <div class="flex flex-row items-center gap-2" id="occurs">
    <span>Every</span>
    <Input class="w-20" type="number" bind:value={recurrence.interval} min={1} />
    <Select.Root selected={freqSelected} onSelectedChange={onFreqChange} required>
      <Select.Trigger id="frequency" class="w-40">
        <Select.Value placeholder="Frequency" />
      </Select.Trigger>
      <Select.Content>
        {#each FREQUENCIES.keys() as freq}
          <Select.Item value={freq}>{mkFreqLabel(freq, recurrence.interval)}</Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>
  </div>
</div>
<div class="flex w-full flex-col gap-1.5">
  <Label for="byweekday" class="font-semibold">On</Label>
  <ToggleGroup.Root
    class="justify-start"
    id="byweekday"
    type="multiple"
    value={byweekday}
    onValueChange={onByweekdayChange}
  >
    {#each WEEKDAYS as weekday}
      <ToggleGroup.Item value={weekday.toString()}>
        {weekday.toString()}
      </ToggleGroup.Item>
    {/each}
  </ToggleGroup.Root>
</div>
<div class="flex w-full flex-col gap-1.5">
  <Label for="occurs" class="font-semibold">Ends</Label>
  <div class="flex flex-row items-center gap-2" id="occurs">
    <Select.Root
      selected={endSelected}
      onSelectedChange={(e) => onEndValChange(e?.value, until, count)}
    >
      <Select.Trigger class="w-24">
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        {#each END_OPTIONS.entries() as [end, label]}
          <Select.Item value={end}>{label}</Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>
    {#if endVal === "until"}
      <DatePicker
        class="w-56"
        id="until"
        bind:value={until}
        onChange={(val) => onEndValChange("until", val, count)}
      />
    {:else if endVal === "count"}
      <Input
        class="w-20"
        type="number"
        bind:value={count}
        min={1}
        on:change={() => onEndValChange("count", until, count)}
      />
      <span>
        {pluralise("occurrence", recurrence.count)}
      </span>
    {/if}
  </div>
</div>
<p class="text-muted-foreground">
  Occurs {rrule.toText()}
</p>
