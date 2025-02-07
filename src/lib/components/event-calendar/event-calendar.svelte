<script lang="ts">
  import { CalendarDate, getLocalTimeZone, isSameMonth, Time } from "@internationalized/date";
  import { ChevronLeft, ChevronRight } from "lucide-svelte";
  import { writable, type Writable } from "svelte/store";
  import Button from "../button/button.svelte";
  import TimeGrid from "./time-grid.svelte";
  import type { CalendarContext, CalendarProps } from "./types";

  export let startDate: CalendarDate;
  export let endDate: CalendarDate;
  export let startTime: Time = new Time(0, 0);
  export let endTime: Time = new Time(23, 59);
  export let step = 30;
  export let precision = 5;
  export let columnGap = "0.5rem";
  export let innerGap: string | undefined = undefined;
  export let line = "1px";
  export let calendarHeight = "1800px";
  let className = "";

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
  const context: CalendarContext = { props };

  $: props.set({
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

  function shiftLeft() {
    console.log("Shifting left");
    startDate = startDate.subtract({ days: 1 });
    endDate = endDate.subtract({ days: 1 });
    console.log(startDate, endDate);
  }

  function shiftRight() {
    console.log("Shifting right");
    startDate = startDate.add({ days: 1 });
    endDate = endDate.add({ days: 1 });
    console.log(startDate, endDate);
  }

  function displayRange(from: CalendarDate, to: CalendarDate) {
    const head =  `${from.year}, ${from.toDate(getLocalTimeZone()).toLocaleDateString(navigator.language || "en", { month: "long" })} ` + `${from.day}`.padStart(2, "0") + " - ";
    if (isSameMonth(from, to)) {
      return head + `${to.day}`.padStart(2, "0");
    } else {
      return head + `${to.toDate(getLocalTimeZone()).toLocaleDateString(navigator.language || "en", { month: "long" })} ` + `${to.day}`.padStart(2, "0");
    }
  }

  export { className as class };
</script>

<div class="flex flex-col overflow-y-scroll py-2 {className}" style="--line: {line}">
  <div class="flex flex-row items-center gap-4 px-2 pb-2">
    <Button on:click={shiftLeft} size="icon" variant="ghost">
      <ChevronLeft />
    </Button>
    <Button on:click={shiftRight} size="icon" variant="ghost">
      <ChevronRight />
    </Button>
    <h2 class="text-lg text-primary font-semibold">
      {displayRange(startDate, endDate)}
    </h2>
  </div>
  <div class="main-container flex flex-row w-full" style="height: {calendarHeight}">
    <TimeGrid
      start={startTime}
      end={endTime}
      {precision}
      {step}
      hLineWidth={line}
      showTime={true}
      vLineWidth="0px"
      class="w-14 bg-secondary"
    >
    <div class="bg-secondary" style="grid-row: 1; grid-column: 1 / span all" />
    </TimeGrid>
    <slot {context} />
  </div>
</div>

<style>
  .main-container {
    border: var(--line) solid hsl(var(--muted-foreground) / 0.3);
  }
</style>
