<script lang="ts">
  import { Button } from "$lib/components/button";
  import { SidebarPosition } from "$lib/components/sidebar/index.ts";
  import { PanelLeftCloseIcon, PanelLeftOpenIcon, PanelRightCloseIcon } from "lucide-svelte";

  let isExpanded = false;
  let position: SidebarPosition;
  let expandedWidth = "250px";
  let collapsedWidth = "72px";
  let className = "";

  export { isExpanded, position, expandedWidth, collapsedWidth, className as class };
</script>

<nav
  class="z-20 flex h-full shrink-0 grow-0 flex-col items-center justify-between overflow-hidden bg-gray-300 p-2 transition-all duration-200 ease-out {className}"
  style={isExpanded ? `width: ${expandedWidth}` : `width: ${collapsedWidth}`}
>
  <div class="flex w-full justify-around">
    {#if isExpanded}
      {#if $$slots.expanded_top}
        <slot name="expanded_top" />
      {:else}
        <slot name="collapsed_top" />
      {/if}
    {:else}
      <slot name="collapsed_top" />
    {/if}

    <Button
      on:click={() => {
        isExpanded = !isExpanded;
      }}
      variant="ghost"
      size="icon-xl"
    >
      {#if position === SidebarPosition.left}
        {#if isExpanded}
          <PanelLeftCloseIcon />
        {:else}
          <PanelLeftOpenIcon />
        {/if}
      {:else if isExpanded}
        <PanelRightCloseIcon />
      {:else}
        <PanelLeftCloseIcon />
      {/if}
    </Button>
  </div>

  {#if isExpanded}
    {#if $$slots.expanded_main}
      <slot name="expanded_main" />
    {:else}
      <slot name="collapsed_main" />
    {/if}
  {:else}
    <slot name="collapsed_main" />
  {/if}

  <div class="flex w-full justify-around">
    {#if isExpanded}
      {#if $$slots.expanded_bottom}
        <slot name="expanded_bottom" />
      {:else}
        <slot name="collapsed_bottom" />
      {/if}
    {:else}
      <slot name="collapsed_bottom" />
    {/if}
  </div>
</nav>
