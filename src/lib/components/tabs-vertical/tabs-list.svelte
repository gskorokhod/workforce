<script lang="ts">
  import { cn } from "$lib/utils/ui";
  import { Tabs as TabsPrimitive } from "bits-ui";

  type $$Props = TabsPrimitive.ListProps;

  let className: $$Props["class"] = undefined;
  export { className as class };
</script>

<TabsPrimitive.List
  class={cn(
    "inline-flex min-w-32 flex-col justify-center rounded-md bg-muted p-2 text-muted-foreground",
    className,
  )}
  {...$$restProps}
>
  <slot />
</TabsPrimitive.List>
