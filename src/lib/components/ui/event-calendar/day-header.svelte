<script lang="ts">
  import { getLocalTimeZone, type CalendarDate } from "@internationalized/date";

  export let day: CalendarDate;
  export let options: Intl.DateTimeFormatOptions = {};
  export let locale: string | string[] = Array.from(navigator.languages) || "en";
  export let tzid: string = getLocalTimeZone() || "UTC";
  export let style: string = "";
  let className: string = "";

  $: formatter = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    ...options,
  })
  $: formatted = formatter.format(day.toDate(tzid));

  export { className as class };
</script>

<span class="{className}" style="{style}">
  <slot {formatted}>
    {formatted}
  </slot>
</span>