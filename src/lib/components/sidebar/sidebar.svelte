<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { SidebarPosition } from "$lib/components/sidebar/index.ts";
  import { PanelLeftCloseIcon, PanelLeftOpenIcon, PanelRightCloseIcon } from "lucide-svelte";

  let isExpanded = false;
  let position: SidebarPosition;
  let className = "";

  export { isExpanded, position, className as class };
</script>

<nav
  class="z-20 flex h-dvh fixed top-0 bottom-0 shrink-0 grow-0 flex-col items-center justify-between overflow-hidden bg-gray-300 p-2 transition-all duration-300 ease-in-out {className}"
>
  <div class="flex w-full justify-start">
    <slot name="top" />

    <Button
      on:click={() => {
        isExpanded = !isExpanded;
      }}
      variant="ghost"
      size="icon-xl"
      class="{isExpanded ? 'ml-auto': ''}"
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

  <ul class="flex w-full flex-col items-center gap-1 list-none">
    <slot name="main" />
  </ul>

  <div class="flex w-full justify-start">
    <slot name="bottom" />
  </div>
</nav>
