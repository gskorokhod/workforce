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

  export let value: Partial<RecurrenceOptions>;

  let prevByweekday: Weekday[] | undefined = undefined;
  let until = value.until || undefined;
  let count = value.count || 1;
  $: freqSelected = { value: value.freq, label: mkFreqLabel(value.freq, value.interval) };
  $: endVal = value.count ? "count" : value.until ? "until" : "infinite";
  $: endSelected = { value: endVal, label: END_OPTIONS.get(endVal) || "Never" };
  $: byweekday = (value.byweekday || WEEKDAYS).map((day) => day.toString());
  $: dtstart = value.dtstart;
  $: rrule = new RRule(fromRecurrenceOptions(value));

  function onFreqChange(val?: Selected<SupportedFrequency | undefined>) {
    if (val) {
      const fval = val.value;
      if (!fval) {
        return;
      }

      if (fval === RRule.DAILY && value.byweekday) {
        prevByweekday = value.byweekday;
        value.byweekday = undefined;
      } else if (fval !== RRule.DAILY && prevByweekday) {
        value.byweekday = prevByweekday;
        prevByweekday = undefined;
      }

      value.freq = fval;
    }
  }

  function onByweekdayChange(val: string[] | undefined) {
    if (!val) {
      return;
    }

    if (value.freq === RRule.DAILY) {
      value = {
        ...value,
        freq: RRule.WEEKLY,
        interval: 1,
      };
    }

    const byweekday = WEEKDAYS.filter((day) => val.includes(day.toString()));
    value.byweekday = byweekday;
  }

  function onDtstartChange(val: DateValue | undefined) {
    if (!val) return;

    if (value.dtstart) {
      value.dtstart = value.dtstart.set(val);
    } else {
      value.dtstart = toZoned(val, getLocalTimeZone());
    }
  }

  function pluralise(unit: string, n?: number | string) {
    const num = typeof n === "string" ? parseInt(n) : n;
    return num === 1 ? unit : `${unit}s`;
  }

  function mkFreqLabel(freq?: SupportedFrequency, n?: number) {
    if (!freq) return "";
    return pluralise(FREQUENCIES.get(freq) || "", n);
  }

  function onEndValChange(
    end: string | undefined,
    until: DateValue | undefined,
    count: number | undefined,
  ) {
    if (end) {
      if (end === "infinite") {
        value.until = undefined;
        value.count = undefined;
      } else if (end === "until") {
        value.until = until;
        value.count = undefined;
      } else if (end === "count") {
        value.count = count;
        value.until = undefined;
      }
    }
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
    <Input class="w-20" type="number" bind:value={value.interval} min={1} />
    <Select.Root selected={freqSelected} onSelectedChange={onFreqChange} required>
      <Select.Trigger id="frequency" class="w-40">
        <Select.Value placeholder="Frequency" />
      </Select.Trigger>
      <Select.Content>
        {#each FREQUENCIES.keys() as freq}
          <Select.Item value={freq}>{mkFreqLabel(freq, value.interval)}</Select.Item>
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
        {pluralise("occurrence", value.count)}
      </span>
    {/if}
  </div>
</div>
<p class="text-muted-foreground">
  Occurs {rrule.toText()}
</p>
