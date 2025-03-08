<script lang="ts">
  import { CalendarDate, getLocalTimeZone, isSameMonth, Time } from "@internationalized/date";
  import { ChevronLeft, ChevronRight } from "lucide-svelte";
  import { writable, type Writable } from "svelte/store";
  import Button from "../ui/button/button.svelte";
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
    const head =
      `${from.year}, ${from.toDate(getLocalTimeZone()).toLocaleDateString(navigator.language || "en", { month: "long" })} ` +
      `${from.day}`.padStart(2, "0") +
      " - ";
    if (isSameMonth(from, to)) {
      return head + `${to.day}`.padStart(2, "0");
    } else {
      return (
        head +
        `${to.toDate(getLocalTimeZone()).toLocaleDateString(navigator.language || "en", { month: "long" })} ` +
        `${to.day}`.padStart(2, "0")
      );
    }
  }

  export { className as class };
</script>

<div class="flex flex-col {className}">
  <div class="z-20 flex flex-row items-center gap-4 p-2 shadow">
    <Button on:click={shiftLeft} size="icon" variant="ghost">
      <ChevronLeft />
    </Button>
    <Button on:click={shiftRight} size="icon" variant="ghost">
      <ChevronRight />
    </Button>
    <h2 class="text-lg font-semibold text-primary">
      {displayRange(startDate, endDate)}
    </h2>
  </div>
  <div class="flex h-full w-full flex-col overflow-y-scroll">
    <div
      class="main-container flex w-full flex-row"
      style="height: {calendarHeight}; --line: {line}"
    >
      <TimeGrid
        start={startTime}
        end={endTime}
        {precision}
        {step}
        hLineWidth={line}
        showTime={true}
        vLineWidth="0px"
        class="w-14 bg-accent"
      >
        <div class="bg-accent" style="grid-row: 1; grid-column: 1 / span all" />
      </TimeGrid>
      <slot {context} />
    </div>
  </div>
</div>

<style>
  .main-container {
    border: var(--line) solid hsl(var(--muted-foreground) / 0.3);
  }
</style>
