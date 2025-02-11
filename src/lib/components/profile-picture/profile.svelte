<script lang="ts" generics="T extends Display">
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { Icon, type Display } from "$lib/ui";
  import { ProfilePicture, type Size } from ".";
  import ProfileTooltip from "./profile-tooltip.svelte";

  export let item: T | undefined = undefined;
  export let size: Size = "md";
  export let variant: "default" | "text" | "full" = "default";
  export let defaultIcon: Icon | undefined = undefined;
  export let emptyIcon: Icon | undefined = undefined;
  export let placeholder: string;
  export let group: string | undefined = undefined;
  export let hoverEffects = true;
  let className = "";

  $: {
    console.log("item", item);
  }

  export { className as class };
</script>

<Tooltip.Root openDelay={200} closeDelay={200} {group}>
  {#if variant === "text"}
    <Tooltip.Trigger class="w-max {className}">
      <span class="decoration-2 {hoverEffects && 'hover:underline'}">
        {item?.name || placeholder}
      </span>
    </Tooltip.Trigger>
  {:else if variant === "full"}
    <Tooltip.Trigger
      class="flex w-max flex-row items-center justify-center gap-2 rounded-full px-2 py-0.5 decoration-2 transition-all hover:bg-accent {hoverEffects &&
        'outline-none hover:outline-accent-foreground'} {className}"
    >
      <ProfilePicture {item} {size} {defaultIcon} {emptyIcon} class="!pointer-events-none" />
      <span>{item?.name || placeholder}</span>
    </Tooltip.Trigger>
  {:else}
    <Tooltip.Trigger class="w-max rounded-full {className}">
      <ProfilePicture
        {item}
        {size}
        {defaultIcon}
        {emptyIcon}
        class={hoverEffects ? "" : "!pointer-events-none"}
      />
    </Tooltip.Trigger>
  {/if}
  <Tooltip.Content>
    <ProfileTooltip {item} />
  </Tooltip.Content>
</Tooltip.Root>
