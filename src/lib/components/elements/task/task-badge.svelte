<!--suppress ES6UnusedImports -->
<script lang="ts">
  import type { Task } from "$lib/types";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { ClipboardIcon, PlusIcon } from "lucide-svelte";
  import Icon from "$lib/components/ui/icon/icon.svelte";
  import Chip from "$lib/components/ui/chip/chip.svelte";
  import { capitalize, getTextColour } from "$lib/utils.js";
  import { ChipVariant } from "$lib/components/ui/chip";

  let task: Task | undefined;
  let placeholder: string = "No task selected";
  let variant: ChipVariant = ChipVariant.default;
  let popoverEnabled: boolean = true;
  let compact: boolean = true;
  let className: string = "";

  // noinspection ReservedWordAsName
  export { task, variant, icon_variant, compact, popoverEnabled, placeholder, className as class };
</script>

<Tooltip.Root>
  <Tooltip.Trigger>
    {#if task}
      {#if compact}
        <Chip variant={ChipVariant.colorOutline} color={task.icon.color} class={className}>
          <Icon icon={task.icon} slot="icon" variant="monochrome" class="w-5 h-5" />
        </Chip>
      {:else }
        <Chip variant={ChipVariant.colorSolid} color={task.icon.color} class={className}>
          <Icon icon={task.icon} slot="icon" variant="monochrome" class="w-5 h-5" />
          {capitalize(task.name)}
        </Chip>
      {/if}
    {:else}
      {#if compact}
        <Chip class={className} {variant}>
          <ClipboardIcon slot="icon" />
          <PlusIcon slot="hover_icon" />
        </Chip>
      {:else}
        <Chip class={className} {variant}>
          <ClipboardIcon slot="icon" />
          <PlusIcon slot="hover_icon" />
          {capitalize(placeholder)}
        </Chip>
      {/if}
    {/if}
  </Tooltip.Trigger>
  {#if popoverEnabled}
    <Tooltip.Content class="max-w-[250px]">
      {#if task}
        <h3>{capitalize(task.name)}</h3>
        <p class="text-muted-foreground">{task.description}</p>
      {:else}
        {placeholder}
      {/if}
    </Tooltip.Content>
  {/if}
</Tooltip.Root>
