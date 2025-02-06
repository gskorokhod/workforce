<script lang="ts">
  import { dtMax, dtMin, minutesBetween } from "$lib/model/temporal/utils";
  import { Time } from "@internationalized/date";
  import { onDestroy, onMount } from "svelte";
  import { v4 as uuid } from "uuid";
  import type { TimeGridContext } from "./types";

  export let key: number | string = uuid();
  export let start: Time = new Time(0, 0);
  export let end: Time = new Time(23, 59);
  export let tgContext: TimeGridContext;
  let extraStyle = "";
  let className = "";

  const strKey = String(key);
  const gridProps = tgContext.props;
  const intervals = tgContext.intervals;
  const startCols = tgContext.startCols;

  // Calculate values for positioning
  $: visible = end.compare($gridProps.start) >= 0 && start.compare($gridProps.end) <= 0;
  $: tStart = dtMax($gridProps.start, start);
  $: tEnd = dtMin($gridProps.end, end);
  $: offset = minutesBetween($gridProps.start, tStart);
  $: duration = minutesBetween(tStart, tEnd);
  $: startRow = Math.floor(offset / $gridProps.precision);
  $: endRow = Math.ceil((offset + duration) / $gridProps.precision);

  // Subscribe to the startCols map and set our column accordingly
  $: col = $startCols.get(strKey) || 1;
  $: ml = col > 1 ? $gridProps.columnGap : "0";
  $: style = `\
      grid-row-start: ${startRow + 1}; \
      grid-row-end: ${endRow + 1}; \
      grid-column-start: ${col + 1}; \
      grid-column-end: ${col + 1}; \
      margin-left: ${ml}; \
      z-index: 1; \
      height: 100%; \
      overflow: hidden; \
      ${extraStyle} \
    `;

  // Notify the context if our time interval changes
  $: intervals.update((data) => {
    console.log(`Updating item: [${start} - ${end}], key: ${strKey}`);
    if (visible) {
      data.set(strKey, { start, end });
    } else {
      data.delete(strKey);
    }
    return data;
  });

  // Notify the context when this item is created
  onMount(() => {
    console.log(`Mounting item: [${start} - ${end}], key: ${strKey}`);
    if (visible) {
      startCols.update((cols) => {
        cols.set(strKey, col);
        return cols;
      });
      intervals.update((data) => {
        data.set(strKey, { start, end });
        return data;
      });
    }
  });

  // Notify the context when this item is destroyed
  onDestroy(() => {
    console.log(`Unmounting item: [${start} - ${end}], key: ${strKey}`);
    intervals.update((data) => {
      data.delete(strKey);
      return data;
    });
    startCols.update((cols) => {
      cols.delete(strKey);
      return cols;
    });
  });

  export { className as class, extraStyle as style };
</script>

<div class="{!visible && 'hidden'} {className}" {style}>
  <slot />
</div>
