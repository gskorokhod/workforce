<script lang="ts">
  import { cn } from "$lib/utils/ui";
  import { Tabs as TabsPrimitive } from "bits-ui";

  type $$Props = TabsPrimitive.Props;
  export let orientation: $$Props["orientation"] = "horizontal";

  let className: $$Props["class"] = undefined;
  export { className as class };
</script>

<TabsPrimitive.Root
  class={cn("flex rounded-md", orientation === "vertical" ? "flex-row" : "flex-col", className)}
  {orientation}
  {...$$restProps}
>
  <slot />
</TabsPrimitive.Root>
