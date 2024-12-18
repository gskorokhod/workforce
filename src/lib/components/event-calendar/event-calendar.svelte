<script lang="ts">
  import { CalendarDate, Time } from "@internationalized/date";
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

  export { className as class };
</script>

<div class={className} style="--line: {line}">
  <div class="flex h-fit w-full flex-row justify-between">
    <slot name="header" {context} />
    <div class="mb-2 ml-auto flex h-fit w-fit flex-row gap-2">
      <Button size="icon-xl" variant="ghost" on:click={shiftLeft}>
        <ChevronLeft />
      </Button>
      <Button size="icon-xl" variant="ghost" on:click={shiftRight}>
        <ChevronRight />
      </Button>
    </div>
  </div>
  <div class="main-container w-wull flex h-full flex-row">
    <!-- Yes, there is a weird magic value for the bottom padding. Yes, this is *bad*. Please ignore for now :) -->
    <!-- The grid doesn't always fit its container exactly (especially inside flex and such) so we have to add extra padding at the bottom so it doesnt look borked -->
    <!-- By trial and error I have found a value that seems to do the trick -->
    <TimeGrid
      start={startTime}
      end={endTime}
      {precision}
      {step}
      hLineWidth={line}
      showTime={true}
      vLineWidth="0px"
      class="time-col mt-10 h-full w-14"
      style="padding-bottom: calc(2.5rem - {line})"
    />
    <slot {context} />
  </div>
</div>

<style>
  .main-container {
    border: var(--line) solid hsl(var(--muted-foreground) / 0.3);
  }
</style>
