<script lang="ts">
  import { cn } from "$lib/utils/ui";
  import { Tabs as TabsPrimitive } from "bits-ui";

  type $$Props = TabsPrimitive.Props;

  let className: $$Props["class"] = undefined;
  export { className as class };
</script>

<TabsPrimitive.Root
  class={cn("inline-flex flex-row gap-4 rounded-md", className)}
  {...$$restProps}
  orientation="vertical"
>
  <slot />
</TabsPrimitive.Root>
