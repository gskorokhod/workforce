<script lang="ts" generics="T extends ZonedDateTime | CalendarDateTime | Date | TimeDuration">
  import { CalendarDateTime, ZonedDateTime, type TimeDuration } from "@internationalized/date";
  import { Input } from "../input";

  export let value: T | undefined = undefined;
  export let onChange: (val: T) => void = () => {};
  export let id: string | undefined = undefined;
  let className: string = "";

  function zdtString(zdt: ZonedDateTime | CalendarDateTime): string {
    const hours = zdt.hour.toString().padStart(2, "0");
    const minutes = zdt.minute.toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  function dateString(dt: Date): string {
    const hours = dt.getHours().toString().padStart(2, "0");
    const minutes = dt.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  function durationString(duration?: TimeDuration): string {
    if (!duration) {
      return "00:00";
    }
    const hours = (duration.hours || 0).toString().padStart(2, "0");
    const minutes = (duration.minutes || 0).toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  function handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const [hours, minutes] = input.value.split(":").map(Number);

    if (value instanceof ZonedDateTime || value instanceof CalendarDateTime) {
      value = value.set({ hour: hours, minute: minutes }) as T;
    } else if (value instanceof Date) {
      value = new Date(value.getFullYear(), value.getMonth(), value.getDate(), hours, minutes) as T;
    } else {
      value = {
        hours,
        minutes
      } as T;
    }

    onChange(value);
  }

  export { className as class };
</script>

{#if value instanceof ZonedDateTime || value instanceof CalendarDateTime}
  <Input
    {id}
    class="max-w-20 {className}"
    type="time"
    value={zdtString(value)}
    on:input={handleInput}
  />
{:else if value instanceof Date}
  <Input
    {id}
    class="max-w-20 {className}"
    type="time"
    value={dateString(value)}
    on:input={handleInput}
  />
{:else}
  <Input
    {id}
    class="max-w-20 {className}"
    type="time"
    value={durationString(value)}
    on:input={handleInput}
  />
{/if}
