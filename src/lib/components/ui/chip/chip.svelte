<script lang="ts">
  import { chipVariants, type Props } from "$lib/components/ui/chip/index.ts";
  import { cn } from "$lib/utils/utils.ts";
  import { PlusIcon } from "lucide-svelte";

  type $$Props = Props;

  let variant: $$Props["variant"] = "default";
  let size: $$Props["size"] = "md";
  let color: $$Props["color"] = undefined;
  let className: $$Props["class"] = "";

  let style: string = "";
  $: {
    if (color) {
      const hex = color.hex();
      const text = color.isDark()
        ? "hsl(var(--primary-foreground) / 1)"
        : "hsl(var(--primary) / 1)";
      const darkened = color.darken(0.2).hex();
      style = `--chip-color: ${hex}; --chip-text-color: ${text}; --chip-darkened-color: ${darkened};`;
    }
  }

  export { variant, size, color, className as class };
</script>

<div
  class={cn(
    chipVariants({
      variant: color ? "none" : variant,
      size,
      className
    })
  )}
  class:color
  class:outline={color && variant === "outline"}
  class:solid={color && variant !== "outline"}
  {style}
  {...$$restProps}
>
  <span
    class="group-hover/chip:hidden {$$slots.default && 'pl-2'} {$$slots.hover &&
      'group-hover/chip:pl-2'}"
  >
    <slot name="icon">
      <PlusIcon />
    </slot>
  </span>
  <span
    class="hidden group-hover/chip:inline-block {$$slots.default && 'pl-2'} {$$slots.hover &&
      'group-hover/chip:pl-2'}"
  >
    <slot name="hover_icon">
      <slot name="icon">
        <PlusIcon />
      </slot>
    </slot>
  </span>
  {#if $$slots.default}
    <span class="pr-2 group-hover/chip:hidden">
      <slot />
    </span>
  {/if}
  {#if $$slots.default || $$slots.hover}
    <span class="hidden pr-2 group-hover/chip:inline-block">
      <slot name="hover">
        <slot />
      </slot>
    </span>
  {/if}
</div>

<style>
  .color.solid {
    background-color: var(--chip-color);
    color: var(--chip-text-color);
  }

  .color.solid:hover {
    outline: 2px solid hsl(var(--accent-foreground) / 1);
  }

  .color {
    color: var(--chip-darkened-color);
    position: relative;
    z-index: 1;
  }

  .color.outline {
    outline: 2px solid var(--chip-darkened-color);
  }

  .color::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.1;
    z-index: -1;
    background: var(--chip-color);
    border-radius: 9999px;
  }

  .color:hover {
    outline: 2px solid var(--chip-darkened-color);
  }

  .color.outline:hover {
    color: var(--chip-text-color);
    background-color: var(--chip-color);
    outline: 2px solid var(--chip-color);
  }
</style>
