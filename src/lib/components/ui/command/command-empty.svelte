<script lang="ts">
  import { Command as CommandPrimitive } from "cmdk-sv";
  import { cn } from "$lib/utils/ui.js";

  type $$Props = CommandPrimitive.EmptyProps;
  let className: string | undefined | null = undefined;

  // noinspection ReservedWordAsName
  export { className as class };
</script>

<CommandPrimitive.Empty class={cn("py-6 text-center text-sm", className)} {...$$restProps}>
  <slot />
</CommandPrimitive.Empty>
