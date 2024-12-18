<script lang="ts" generics="T extends Display">
  import * as Tooltip from "$lib/components/tooltip";
  import { Icon, type Display } from "$lib/ui";
  import { ProfilePicture, type Size } from ".";
  import ProfileTooltip from "./profile-tooltip.svelte";

  export let item: T | undefined = undefined;
  export let size: Size = "md";
  export let variant: "default" | "text" | "full" = "default";
  export let defaultIcon: Icon | undefined = undefined;
  export let emptyIcon: Icon | undefined = undefined;
  export let placeholder: string;
  let className = "";

  $: {
    console.log("item", item);
  }

  export { className as class };
</script>

<Tooltip.Root>
  {#if variant === "text"}
    <Tooltip.Trigger class="w-max">
      <span class="decoration-2 hover:underline">
        {item?.name || placeholder}
      </span>
    </Tooltip.Trigger>
  {:else if variant === "full"}
    <Tooltip.Trigger
      class="flex w-max flex-row items-center justify-center gap-2 rounded-full px-2 py-0.5 decoration-2 outline-none transition-all hover:bg-accent hover:outline-accent-foreground {className}"
    >
      <ProfilePicture {item} {size} {defaultIcon} {emptyIcon} class="!pointer-events-none" />
      <span>{item?.name || placeholder}</span>
    </Tooltip.Trigger>
  {:else}
    <Tooltip.Trigger class="w-max rounded-full">
      <ProfilePicture {item} {size} {defaultIcon} {emptyIcon} />
    </Tooltip.Trigger>
  {/if}
  <!-- <Tooltip.Trigger class="flex flex-row items-center justify-center gap-2 decoration-2 outline-none hover:bg-accent transition-all rounded-full w-max {variant === "full" ? "py-0.5 px-2" : "p-0"} {variant === "text" ? "hover:underline" : "hover:outline-accent-foreground"} {className}">
    {#if showImage}
      <ProfilePicture {item} {size} {defaultIcon} {emptyIcon} />
    {/if}

    {#if showName}
      <span>{item?.name || placeholder}</span>
    {/if}
  </Tooltip.Trigger> -->
  <Tooltip.Content>
    <ProfileTooltip {item} />
  </Tooltip.Content>
</Tooltip.Root>
