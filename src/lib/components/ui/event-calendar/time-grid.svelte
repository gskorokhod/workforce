<script lang="ts">
  import { cmpTime, fmtTime, minutesBetween, timeFromMinutes } from "$lib/backend/temporal/utils";
  import IntervalTree from "@flatten-js/interval-tree";
  import { Time } from "@internationalized/date";
  import { onDestroy, onMount } from "svelte";
  import { writable } from "svelte/store";
  import type { TimeGridContext, TimeGridProps } from "./types";

  export let start: Time = new Time(0, 0);
  export let end: Time = new Time(23, 59);
  export let step: number = 30;
  export let precision: number = 5;
  export let columns = 1;
  export let showTime = true;
  export let columnGap = "0.5rem";
  export let rowLine = "1px";
  export let style: string = "";
  let className: string = "";

  const props = writable<TimeGridProps>({ start, end, step, precision, columns, columnGap, showTime });
  const intervals = writable(new IntervalTree<string>());
  const startCols = writable(new Map<string, number>());
  const context: TimeGridContext = { props, intervals, startCols };

  $: context.props.set({ start, end, step, precision, columns, columnGap, showTime });
  $: rows = Math.ceil(minutesBetween(start, end) / precision);
  $: visibleRows = Math.ceil(minutesBetween(start, end) / step);
  $: cols = $props.columns;
  $: colGap = $props.columnGap;

  onMount(() => {
    console.log("TimeGrid mounted");
  });

  onDestroy(() => {
    console.log("TimeGrid unmounted");
  });

  context.startCols.subscribe((cols) => {
    const maxCol = Math.max(...Array.from(cols.values()));
    context.props.update((p) => ({ ...p, columns: maxCol }));
    columns = maxCol;
  });

  context.intervals.subscribe((tree) => {
    console.log("Intervals updated");

    const startCols = new Map<string, number>();
    tree.forEach((interval, key) => {
      const si: [number, number] = [interval.low + 1, interval.high - 1];
      const overlap = tree.search(si, (oKey, oInterval) => {
        return {
          key: oKey,
          start: timeFromMinutes(oInterval.low),
          end: timeFromMinutes(oInterval.high),
          slot: oInterval
        }
      });
      overlap.sort((a, b) => cmpTime(a.start, b.start) || -cmpTime(a.end, b.end));
      const idx = overlap.findIndex((o) => o.key === key);
      startCols.set(key, idx + 1);
    });

    console.log("Start cols:", startCols);
    context.startCols.set(startCols);
  });

  export { className as class };
</script>
  
<div class={className} style="{style}">
  <div class="time-grid" style="--rows: {rows}; --cols: {cols}; --colGap: {colGap}; --rLine: {rowLine}">
    {#each Array.from({ length: visibleRows + 1 }) as _, i}
      {@const rw = (i * $props.step) / $props.precision}
      <div class="line-container" style="grid-row: {rw + 1}; grid-column: 1 / span all">
        <div class="line"></div>
      </div>
      {#if showTime}
        <div class="time-container" style="grid-row: {rw + 1}; grid-column: 1;">
          <span class="text-muted-foreground">
            {fmtTime($props.start.add({ minutes: i * $props.step }))}
          </span>
        </div>
      {/if}
    {/each}
    <slot {context}/>
  </div>
</div>

<style>
  .time-grid {
    display: grid;
    grid-template-rows: repeat(var(--rows), 1fr);
    grid-template-columns: min-content repeat(var(--cols), 1fr);
    row-gap: var(--rLine);
    width: 100%;
    height: 100%;
    position: relative;
  }

  .time-container {
    margin-left: 0.25rem;
  }

  .line-container {
    position: relative;
    display: flex;
    align-items: center;
    margin-top: calc(var(--rLine) * -1);
  }

  .line {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: var(--rLine);
    background-color: hsl(var(--muted-foreground) / 0.3);
  }
</style>
  