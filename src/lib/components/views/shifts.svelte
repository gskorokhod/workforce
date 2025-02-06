<script lang="ts">
  import DayColumn from "$lib/components/event-calendar/day-column.svelte";
  import EventCalendar from "$lib/components/event-calendar/event-calendar.svelte";
  import { state as GLOBAL_STATE, Shift } from "$lib/model";
  import { allDaysBetween } from "$lib/model/temporal/utils";
  import { randomColor } from "$lib/utils/misc";
  import {
    getLocalTimeZone,
    isSameDay,
    Time,
    today,
    toTime,
    type CalendarDate
  } from "@internationalized/date";
  import type { Writable } from "svelte/store";
  import TimeGridItem from "../event-calendar/time-grid-item.svelte";

  export let startDate: CalendarDate = today(getLocalTimeZone());
  export let endDate: CalendarDate = startDate.add({ days: 7 });
  export let startTime: Time = new Time(0, 0);
  export let endTime: Time = new Time(23, 59);

  const shifts: Writable<Shift[]> = GLOBAL_STATE.shifts;
  
  $: days = allDaysBetween(startDate, endDate);
  $: colors = new Map($shifts.map(s => [s.uuid, randomColor()]));
</script>

<EventCalendar
  let:context
  bind:startDate
  bind:endDate
  bind:startTime
  bind:endTime
  class="h-[1200px]"
>
  {#each days as day}
    <DayColumn let:tgContext {context} {day}>
      {#each $shifts as shift }
        {#each shift.occurrencesOn(day) as occurrence }
          {@const start = isSameDay(occurrence.start, day) ? toTime(occurrence.start) : startTime}
          {@const end = isSameDay(occurrence.end, day) ? toTime(occurrence.end) : endTime}
          <TimeGridItem {tgContext} {start} {end} class="bg-opacity-30" style="background-color: {colors.get(shift.uuid)};">
            <p>{shift.name}</p>
            <p>
              {occurrence.start.toDate().toLocaleString()} - {occurrence.end.toDate().toLocaleString()}
            </p>
          </TimeGridItem>
        {/each}
        <!-- {#if occurrence}
          
          {@const start = isSameDay(occurrence.start, day) ? occurrence.start : startTime}
          {@const end = isSameDay(occurrence.end, day) ? occurrence.end : endTime}
          <TimeGridItem {tgContext} start={toTime(start)} end={toTime(end)} class="bg-opacity-30" style="background-color: {colors.get(shift.uuid)};">
            <p>{shift.name}</p>
            <p>
              {occurrence.start.toDate().toLocaleString()} - {occurrence.end.toDate().toLocaleString()}
            </p>
          </TimeGridItem>
        {/if} -->
      {/each}
    </DayColumn>
  {/each}
</EventCalendar>
