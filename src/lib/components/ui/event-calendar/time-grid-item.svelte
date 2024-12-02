<script lang="ts">
  import { minutesBetween } from "$lib/backend/temporal/utils";
  import { Time } from "@internationalized/date";
  import { onDestroy, onMount } from "svelte";
  import { v4 as uuid } from "uuid";
  import type { TimeGridContext } from "./types";

  export let key: number | string = uuid();
  export let start: Time = new Time(0, 0);
  export let end: Time = new Time(23, 59);
  export let tgContext: TimeGridContext;
  let isMounted: boolean = false;
  let extraStyle: string = "";
  let className: string = "";

  const strKey = String(key);
  const gridProps = tgContext.props;
  const intervals = tgContext.intervals;
  const startCols = tgContext.startCols;
  
  // Calculate values for positioning
  $: offset = minutesBetween($gridProps.start, start);
  $: duration = minutesBetween(start, end);
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
  $: start, end, intervals.update((data) => {
    console.log(`Updating item: [${start} - ${end}], key: ${strKey}`);
    data.set(strKey, { start, end });
    return data;
  });

  // Notify the context when this item is created
  onMount(() => {
    console.log(`Mounting item: [${start} - ${end}], key: ${strKey}`);
    startCols.update((cols) => {
      cols.set(strKey, col);
      return cols;
    });
    intervals.update((data) => {
      //tree.insert(toInterval(start, end), strKey);
      data.set(strKey, { start, end });
      return data;
    });
    isMounted = true;
  });

  // Notify the context when this item is destroyed
  onDestroy(() => {
    console.log(`Unmounting item: [${start} - ${end}], key: ${strKey}`);
    isMounted = false;
    intervals.update((data) => {
      //data.remove(toInterval(start, end), strKey);
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

<div class={className} {style}>
  <slot />
</div>
