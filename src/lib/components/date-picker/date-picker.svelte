<!--suppress ES6UnusedImports -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Calendar } from "$lib/components/ui/calendar";
  import * as Popover from "$lib/components/ui/popover";
  import { cn } from "$lib/utils/ui.js";
  import { type DateValue, DateFormatter, getLocalTimeZone } from "@internationalized/date";
  import CalendarIcon from "lucide-svelte/icons/calendar";

  const df = new DateFormatter(navigator.language || "en", {
    dateStyle: "long",
  });

  let value: DateValue | undefined = undefined;
  let placeholder = "Select a date";
  let id: string | undefined = undefined;
  let className = "";
  let open = false;
  let onChange: (value: DateValue | undefined) => void = () => {};

  export { value, id, placeholder, onChange, className as class };
</script>

<Popover.Root openFocus bind:open>
  <Popover.Trigger asChild let:builder>
    <Button
      aria-expanded={open}
      {id}
      variant="outline"
      class={cn(
        "w-[280px] justify-start text-left font-normal",
        !value && "text-muted-foreground",
        className,
      )}
      builders={[builder]}
    >
      <CalendarIcon class="mr-2 h-4 w-4" />
      {value ? df.format(value.toDate(getLocalTimeZone())) : placeholder}
    </Button>
  </Popover.Trigger>
  <Popover.Content class="w-auto p-0">
    <Calendar bind:value initialFocus onValueChange={onChange} />
  </Popover.Content>
</Popover.Root>
