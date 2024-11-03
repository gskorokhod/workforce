<script lang="ts" generics="T extends ZonedDateTime | CalendarDateTime | Date | TimeDuration | Time">
  import { fmtTime } from "$lib/backend/temporal/utils";

  import { CalendarDateTime, Time, ZonedDateTime, type TimeDuration } from "@internationalized/date";
  import { Input } from "../input";

  export let value: T | undefined = undefined;
  export let onChange: (val: T) => void = () => {};
  export let id: string | undefined = undefined;
  let className: string = "";

  function handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const [hours, minutes] = input.value.split(":").map(Number);

    if (value instanceof ZonedDateTime || value instanceof CalendarDateTime) {
      value = value.set({ hour: hours, minute: minutes }) as T;
    } else if (value instanceof Date) {
      value = new Date(value.getFullYear(), value.getMonth(), value.getDate(), hours, minutes) as T;
    } else if (value instanceof Time) {
      value = value.set({ hour: hours, minute: minutes }) as T;
    } else {
      value = { hours, minutes } as T;
    }

    onChange(value);
  }

  export { className as class };
</script>

<Input
    {id}
    class="max-w-20 {className}"
    type="time"
    value={fmtTime(value)}
    on:input={handleInput}
  />
  