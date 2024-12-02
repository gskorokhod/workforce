<script lang="ts">
  import type { CalendarDate } from '@internationalized/date';
  import { onDestroy, onMount } from 'svelte';
  import { v4 as uuid } from "uuid";
  import DayHeader from "./day-header.svelte";
  import TimeGrid from "./time-grid.svelte";
  import type { CalendarContext } from "./types";

  export let key: number | string = uuid();
  export let day: CalendarDate;
  export let context: CalendarContext;
  export let innerGap: string | undefined = undefined;
  let isMounted: boolean = false;
  let extraStyle: string = "";
  let className: string = "";

  const strKey = String(key);
  const props = context.props;
  const cols = context.cols;
  const dates = context.dates;

  $: start = $props.startTime;
  $: end = $props.endTime;
  $: step = $props.step;
  $: precision = $props.precision;
  $: columnGap = $props.columnGap;
  $: inGap = innerGap ?? $props.innerGap ?? columnGap;
  $: line = $props.line;
  $: col = $cols.get(strKey) || 0;
  $: first = col === 1;
  $: hidden = col === 0;
  $: style = hidden ? "display: none" : `
      grid-column: ${col}; \
      border-left: ${first ? line : "0px"} solid hsl(var(--muted-foreground) / 0.3); \
      border-right: ${line} solid hsl(var(--muted-foreground) / 0.3); \
      border-bottom: ${line} solid hsl(var(--muted-foreground) / 0.3); \
      border-top: ${line} solid hsl(var(--muted-foreground) / 0.3); \
      padding-bottom: ${step}px; \
      overflow: hidden; \
      ${extraStyle}
    `;

  $: day, dates.update((dates) => {
    console.log(`Updating day column: ${day}`);
    dates.set(strKey, day);
    return dates;
  });

  onMount(() => {
    console.log(`Mounting day column: ${day}`);
    context.cols.update((cols) => {
      cols.set(strKey, 0);
      return cols;
    });
    context.dates.update((dates) => {
      dates.set(strKey, day);
      return dates;
    });
    isMounted = true;
  });

  onDestroy(() => {
    console.log(`Unmounting day column: ${day}`);
    isMounted = false;
    context.cols.update((cols) => {
      cols.delete(strKey);
      return cols;
    });
    context.dates.update((dates) => {
      dates.delete(strKey);
      return dates;
    });
  });

  export { className as class, extraStyle as style };
</script>

<div class="{className}" {style}>
  <DayHeader {day} class="pt-1 pb-2 text-center {first && 'pl-[20%]'}"/>
  <TimeGrid let:tgContext {start} {end} {precision} {step} {line} showTime={first} columnGap={inGap} padRight={columnGap} class="h-full">
    <slot {tgContext} />
  </TimeGrid>
</div>