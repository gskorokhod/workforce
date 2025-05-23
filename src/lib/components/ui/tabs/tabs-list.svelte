<script lang="ts">
  import { Tabs as TabsPrimitive } from "bits-ui";
  import { cn } from "$lib/utils/ui";

  type $$Props = TabsPrimitive.ListProps;

  let className: $$Props["class"] = undefined;
  export { className as class };
</script>

<TabsPrimitive.List
  class={cn(
    "flex items-center justify-center gap-1 rounded-md bg-muted p-2 text-muted-foreground data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start data-[orientation=vertical]:justify-start",
    className,
  )}
  {...$$restProps}
>
  <slot />
</TabsPrimitive.List>
