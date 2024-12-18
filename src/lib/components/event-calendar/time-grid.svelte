<script lang="ts">
  import { fmtTime, minutesBetween, toMinutes } from "$lib/model/temporal/utils";
  import { Time } from "@internationalized/date";
  import { writable } from "svelte/store";
  import type { TimeGridContext, TimeGridProps } from "./types";

  export let start: Time = new Time(0, 0);
  export let end: Time = new Time(23, 59);
  export let step = 30;
  export let precision = 5;
  export let showTime = true;
  export let columnGap = "0.5rem";
  export let hLineWidth = "1px";
  export let vLineWidth: string | undefined = undefined;
  export let padLeft = "0px";
  export let padRight = "0px";
  export let style = "";
  let className = "";

  const props = writable<TimeGridProps>({ start, end, step, precision, columnGap, showTime });
  const intervals = writable(new Map<string, { start: Time; end: Time }>());
  const startCols = writable(new Map<string, number>());
  export const tgContext: TimeGridContext = { props, intervals, startCols };

  $: tgContext.props.set({ start, end, step, precision, columnGap, showTime });
  $: rows = Math.floor(minutesBetween(start, end) / precision);
  $: visibleRows = Math.floor(minutesBetween(start, end) / step);
  $: colGap = $props.columnGap;
  $: colVals = Array.from($startCols.values());
  $: cols = Math.max(...colVals, 0);

  tgContext.intervals.subscribe((tree) => {
    interface Event {
      key: string;
      start: number;
      end: number;
    }

    const startCols = new Map<string, number>();
    const events: Event[] = [];

    tree.forEach((interval, key) => {
      events.push({
        key,
        start: toMinutes(interval.start),
        end: toMinutes(interval.end),
      });
    });

    events.sort((a, b) => a.start - b.start || b.end - a.end);

    const columns: number[] = [];

    events.forEach((event) => {
      const { key, start, end } = event;
      let assigned = false;

      for (let i = 0; i < columns.length; i++) {
        if (columns[i] <= start) {
          columns[i] = end;
          startCols.set(key, i + 1);
          console.log(`Assigned event ${key} to existing column ${i + 1}`);
          assigned = true;
          break;
        }
      }

      if (!assigned) {
        columns.push(end);
        startCols.set(key, columns.length);
        console.log(`Assigned event ${key} to new column ${columns.length}`);
      }
    });

    console.log("Start cols:", startCols);
    tgContext.startCols.set(startCols);
  });

  export { className as class };
</script>

<div class={className} {style}>
  <div
    class="time-grid"
    style="--rows: {rows}; --cols: {cols}; --colGap: {colGap}; --hLineWidth: {hLineWidth}; --vLineWidth: {vLineWidth ??
      hLineWidth}; --padRight: {padRight}"
  >
    {#each Array.from({ length: visibleRows }) as _, i}
      {@const rw = Math.floor((i * $props.step) / $props.precision)}
      <div class="hline-container" style="grid-row: {rw + 1}; grid-column: 1 / span all">
        <div class="hline"></div>
      </div>
      <div
        class="time-container"
        style="grid-row: {rw + 1}; grid-column: 1; width: {showTime ? 'fit-content' : padLeft}"
      >
        <span class={showTime ? "ml-1 mt-1 text-muted-foreground" : "invisible"}>
          {fmtTime($props.start.add({ minutes: i * $props.step }))}
        </span>
      </div>
    {/each}
    {#if showTime}
      <div class="vline-container" style="grid-row: 1 / span all; grid-column: 1">
        <div class="vline"></div>
      </div>
    {/if}
    <slot {tgContext} />
  </div>
</div>

<style>
  .time-grid {
    display: grid;
    grid-template-rows: repeat(var(--rows), 1fr);
    grid-template-columns: min-content repeat(var(--cols), 1fr) var(--padRight);
    row-gap: var(--hLineWidth);
    width: 100%;
    height: 100%;
  }

  .time-container {
    overflow: hidden;
    height: fit-content;
  }

  .hline-container {
    position: relative;
    display: flex;
    align-items: center;
  }

  .vline-container {
    position: relative;
    display: flex;
    align-items: center;
  }

  .vline {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: var(--vLineWidth);
    background-color: hsl(var(--muted-foreground) / 0.3);
  }

  .hline {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: var(--hLineWidth);
    margin-top: calc(var(--hLineWidth) * -1);
    background-color: hsl(var(--muted-foreground) / 0.3);
  }
</style>
