<script lang="ts">
  import { calendarDaysBetween } from "$lib/backend/temporal/utils";
  import { CalendarDate, Time } from "@internationalized/date";
  import { ChevronLeft, ChevronRight } from "lucide-svelte";
  import { writable, type Writable } from "svelte/store";
  import Button from "../button/button.svelte";
  import type { CalendarContext, CalendarProps } from "./types";

  export let startDate: CalendarDate;
  export let endDate: CalendarDate;
  export let startTime: Time = new Time(0, 0);
  export let endTime: Time = new Time(23, 59);
  export let step: number = 30;
  export let precision: number = 5;
  export let columnGap: string = "0.5rem";
  export let innerGap: string | undefined = undefined;
  export let line: string = "1px";
  let className: string = "";

  const props: Writable<CalendarProps> = writable({
    startDate,
    endDate,
    startTime,
    endTime,
    step,
    precision,
    columnGap,
    innerGap,
    line,
  });
  const cols: Writable<Map<string, number>> = writable(new Map());
  const dates: Writable<Map<string, CalendarDate>> = writable(new Map());
  const context: CalendarContext = { props, cols, dates };

  $: props.set({ startDate, endDate, startTime, endTime, step, precision, columnGap, innerGap, line });
  $: days = calendarDaysBetween(startDate, endDate);

  context.dates.subscribe((dates) => {
    console.log("Dates updated");
    const entries = Array.from(dates.entries());
    const toShow: [string, CalendarDate][]= [];
    const toHide: string[] = [];

    for (const [key, date] of entries) {
      if (date.compare(startDate) >= 0 && date.compare(endDate) <= 0) {
        toShow.push([key, date]);
      } else {
        toHide.push(key);
      }
    }
    toShow.sort((a, b) => a[1].compare(b[1]));

    const newCols = new Map<string, number>();
    toShow.forEach(([key], index) => {
      newCols.set(key, index + 1);
    });
    toHide.forEach((key) => {
      newCols.set(key, 0);
    });

    console.log(newCols);

    context.cols.set(newCols);
  });
  
  export { className as class };
</script>

<div class="{className}">
  <div class="flex flex-row w-full h-fit justify-between">
    <slot name="header" {context} />
    <div class="flex flex-row h-fit w-fit gap-2">
      <Button size="icon-xl" variant="ghost" on:click={() => props.update((p) => ({ ...p, startDate: startDate.subtract({days: 1}) }))}>
        <ChevronLeft />
      </Button>
      <Button size="icon-xl" variant="ghost" on:click={() => props.update((p) => ({ ...p, startDate: startDate.add({days: 1}) }))}>
        <ChevronRight />
      </Button>
    </div>
  </div>
  <div class="calendar-grid" style="--cols: {days}">
    <slot {context} />
  </div>
</div>

<style>
  .calendar-grid {
    height: 100%;
    width: 100%;
    display: grid;
    grid-template-columns: 1.2fr repeat(var(--cols), 1fr);
    grid-template-rows: 100%;
  }
</style>
