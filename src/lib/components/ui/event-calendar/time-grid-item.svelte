<script lang="ts">
  import { minutesBetween, toMinutes } from "$lib/backend/temporal/utils";
  import { Time } from "@internationalized/date";
  import { onDestroy, onMount } from "svelte";
  import { v4 as uuid } from "uuid";
  import type { TimeGridContext } from "./types";

  export let key: number | string = uuid();
  export let start: Time = new Time(0, 0);
  export let end: Time = new Time(23, 59);
  export let context: TimeGridContext;
  let isMounted: boolean = false;
  let extraStyle: string = "";
  let className: string = "";

  const strKey = String(key);
  const gridProps = context.props;
  const intervals = context.intervals;
  const startCols = context.startCols;

  $: offset = minutesBetween($gridProps.start, start);
  $: duration = minutesBetween(start, end);
  $: startRow = Math.floor(offset / $gridProps.precision);
  $: endRow = Math.ceil((offset + duration) / $gridProps.precision);
  $: col = $startCols.get(strKey) || 1;
  $: ml = col > 1 || $gridProps.showTime ? $gridProps.columnGap : "0";
  $: style = `\
      grid-row-start: ${startRow + 1}; \
      grid-row-end: ${endRow + 1}; \
      grid-column-start: ${col + 1}; \
      grid-column-end: ${col + 1}; \
      margin-left: ${ml}; \
      z-index: 1; \
      ${extraStyle} \
    `;

  onMount(() => {
    console.log(`Mounting item: [${start} - ${end}], key: ${strKey}`);
    startCols.update((cols) => {
      cols.set(strKey, col);
      return cols;
    });
    intervals.update((tree) => {
      tree.insert(toInterval(start, end), strKey);
      return tree;
    });
    isMounted = true;
  });

  onDestroy(() => {
    console.log(`Unmounting item: [${start} - ${end}], key: ${strKey}`);
    isMounted = false;
    intervals.update((tree) => {
      tree.remove(toInterval(start, end), strKey);
      return tree;
    });
    startCols.update((cols) => {
      cols.delete(strKey);
      return cols;
    });
  }); 

  function toInterval(start: Time, end: Time): [number, number] {
    return [toMinutes(start), toMinutes(end)];
  }

  export { className as class, extraStyle as style };
</script>

<div class={className} {style}>
  <slot />
</div>
