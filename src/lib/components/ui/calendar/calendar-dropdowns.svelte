<!--suppress ES6UnusedImports -->
<script lang="ts">
  import { Calendar as CalendarPrimitive } from "bits-ui";
  import {
    DateFormatter,
    getLocalTimeZone,
    today
  } from "@internationalized/date";
  import * as Select from "$lib/components/ui/select/index.js";
  import * as Calendar from "$lib/components/ui/calendar/index.ts";

  type $$Props = CalendarPrimitive.Props;
  type $$Events = CalendarPrimitive.Events;

  let value: $$Props["placeholder"] = today(getLocalTimeZone());

  const monthOptions = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ].map((month, i) => ({ value: i + 1, label: month }));

  const monthFmt = new DateFormatter("en-US", {
    month: "long"
  });

  const yearOptions = Array.from({ length: 100 }, (_, i) => ({
    label: String(new Date().getFullYear() - i),
    value: new Date().getFullYear() - i
  }));

  $: defaultYear = value
    ? {
      value: value.year,
      label: String(value.year)
    }
    : undefined;

  $: defaultMonth = value
    ? {
      value: value.month,
      label: monthFmt.format(value.toDate(getLocalTimeZone()))
    }
    : undefined;

  let className: $$Props["class"] = undefined;
  export { value, className as class };
</script>

<Calendar.Heading class="flex w-full items-center justify-between gap-2 {className}">
  <Select.Root
    selected={defaultMonth}
    items={monthOptions}
    onSelectedChange={(v) => {
          if (!v || !value) return;
          if (v.value === value?.month) return;
          value = value.set({ month: v.value });
        }}
  >
    <Select.Trigger aria-label="Select month" class="w-[60%]">
      <Select.Value placeholder="Select month" />
    </Select.Trigger>
    <Select.Content class="max-h-[200px] overflow-y-auto">
      {#each monthOptions as { value, label }}
        <Select.Item {value} {label}>
          {label}
        </Select.Item>
      {/each}
    </Select.Content>
  </Select.Root>
  <Select.Root
    selected={defaultYear}
    items={yearOptions}
    onSelectedChange={(v) => {
          if (!v || !value) return;
          if (v.value === value?.year) return;
          value = value.set({ year: v.value });
        }}
  >
    <Select.Trigger aria-label="Select year" class="w-[40%]">
      <Select.Value placeholder="Select year" />
    </Select.Trigger>
    <Select.Content class="max-h-[200px] overflow-y-auto">
      {#each yearOptions as { value, label }}
        <Select.Item {value} {label}>
          {label}
        </Select.Item>
      {/each}
    </Select.Content>
  </Select.Root>
</Calendar.Heading>