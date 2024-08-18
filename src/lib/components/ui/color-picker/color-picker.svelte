<!--suppress ES6UnusedImports -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { PipetteIcon } from "lucide-svelte";
  import { getTextColour } from "$lib/utils/utils.ts";

  const DEFAULT_COLOURS: string[] = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#14b8a6",
    "#3b82f6",
    "#8b5cf6",
    "#52525b"
  ];

  let options: string[] = DEFAULT_COLOURS;
  let color: string | undefined = undefined;
  let inputValue: string;
  let className: string = "";
  let onSelect: (c: string) => void = () => {};

  export { options, color, onSelect, className as class };
</script>

<div class="flex flex-row flex-wrap gap-2 {className}">
  {#each options as option}
    <Button
      class="h-6 w-6 rounded-full p-0 outline-offset-2 transition-all hover:drop-shadow-lg focus:drop-shadow-lg"
      style={`background-color: ${option}; color: ${option}; outline: 2px solid ${color === option ? option : "transparent"};`}
      on:click={() => {
        color = option;
        onSelect(color);
      }}
    />
  {/each}
  <Tooltip.Root>
    <Tooltip.Trigger>
      <div
        class="relative h-6 w-6 rounded-full bg-muted text-accent-foreground transition-all hover:drop-shadow-lg"
        style={color && !options.includes(color)
          ? `background-color: ${color}; outline: 2px solid ${color}; outline-offset: 2px`
          : ""}
      >
        <input
          class="absolute left-0 top-0 z-10 h-6 w-6 rounded-full"
          type="color"
          style="opacity: 0.5%"
          bind:value={inputValue}
          on:input={() => {
            color = inputValue;
            onSelect(color);
          }}
        />
        <PipetteIcon
          class="absolute left-0 top-0 h-6 w-6 p-1 text-accent-foreground"
          style={color && !options.includes(color) ? `color: ${getTextColour(color)}` : ""}
        />
      </div>
    </Tooltip.Trigger>
    <Tooltip.Content>Custom colour</Tooltip.Content>
  </Tooltip.Root>
</div>
