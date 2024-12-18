<script lang="ts">
  import type { CalendarDate } from "@internationalized/date";
  import DayHeader from "./day-header.svelte";
  import TimeGrid from "./time-grid.svelte";
  import type { CalendarContext } from "./types";

  export let day: CalendarDate;
  export let context: CalendarContext;
  export let innerGap: string | undefined = undefined;
  let extraStyle = "";
  let className = "";

  const props = context.props;

  $: start = $props.startTime;
  $: end = $props.endTime;
  $: step = $props.step;
  $: precision = $props.precision;
  $: line = $props.line;
  $: columnGap = $props.columnGap;
  $: inGap = innerGap ?? $props.innerGap ?? columnGap;
  $: hidden = day.compare($props.startDate) < 0 || day.compare($props.endDate) > 0;
  $: style = hidden
    ? "display: none;"
    : `
    border-left: ${line} solid hsl(var(--muted-foreground) / 0.3); \
    overflow: hidden; \
    ${extraStyle}
  `;

  export { className as class, extraStyle as style };
</script>

<div class="flex flex-1 flex-col items-center pb-[2.5rem] {className}" {style}>
  <DayHeader {day} class="pb-2 pt-2" />
  <TimeGrid
    let:tgContext
    {start}
    {end}
    {precision}
    {step}
    hLineWidth={line}
    showTime={false}
    columnGap={inGap}
    padRight={columnGap}
    class="h-full w-full"
  >
    <slot {tgContext} />
  </TimeGrid>
</div>
