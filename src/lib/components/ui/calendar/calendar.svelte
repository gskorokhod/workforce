<!--suppress ES6UnusedImports -->
<script lang="ts">
  import { Calendar as CalendarPrimitive } from "bits-ui";
  import * as Calendar from "./index.js";
  import CalendarDropdowns from "./calendar-dropdowns.svelte";
  import { cn } from "$lib/utils/ui.js";

  type $$Props = CalendarPrimitive.Props;

  type $$Events = CalendarPrimitive.Events;

  export let value: $$Props["value"] = undefined;
  export let placeholder: $$Props["placeholder"] = undefined;
  export let weekdayFormat: $$Props["weekdayFormat"] = "short";
  export let variant: "dropdowns" | "buttons" = "dropdowns";
  let className: $$Props["class"] = undefined;

  export { className as class };
</script>

<CalendarPrimitive.Root
  bind:value
  bind:placeholder
  {weekdayFormat}
  class={cn("p-3 disabled:pointer-events-none disabled:cursor-not-allowed", className)}
  {...$$restProps}
  on:keydown
  let:months
  let:weekdays
>
  <Calendar.Header>
    {#if variant === "dropdowns"}
      <CalendarDropdowns bind:value />
    {:else}
      <Calendar.PrevButton />
      <Calendar.Heading />
      <Calendar.NextButton />
    {/if}
  </Calendar.Header>
  <Calendar.Months>
    {#each months as month}
      <Calendar.Grid>
        <Calendar.GridHead>
          <Calendar.GridRow class="flex">
            {#each weekdays as weekday}
              <Calendar.HeadCell>
                {weekday.slice(0, 2)}
              </Calendar.HeadCell>
            {/each}
          </Calendar.GridRow>
        </Calendar.GridHead>
        <Calendar.GridBody>
          {#each month.weeks as weekDates}
            <Calendar.GridRow class="mt-2 w-full">
              {#each weekDates as date}
                <Calendar.Cell {date}>
                  <Calendar.Day {date} month={month.value} />
                </Calendar.Cell>
              {/each}
            </Calendar.GridRow>
          {/each}
        </Calendar.GridBody>
      </Calendar.Grid>
    {/each}
  </Calendar.Months>
</CalendarPrimitive.Root>
