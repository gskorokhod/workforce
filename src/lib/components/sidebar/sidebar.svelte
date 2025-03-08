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
  class="fixed bottom-0 top-0 z-50 flex h-dvh shrink-0 grow-0 flex-col items-center justify-between overflow-hidden bg-accent p-2 transition-all duration-300 ease-in-out {className}"
>
  <div class="flex w-full justify-start">
    <slot name="top" />

    <Button
      on:click={() => {
        isExpanded = !isExpanded;
      }}
      variant="ghost"
      size="icon-xl"
      class={isExpanded ? "ml-auto" : ""}
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

  <ul class="flex w-full list-none flex-col items-center gap-1">
    <slot name="main" />
  </ul>

  <div class="flex w-full justify-start">
    <slot name="bottom" />
  </div>
</nav>
