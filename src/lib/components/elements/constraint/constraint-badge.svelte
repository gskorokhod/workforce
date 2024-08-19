<!--suppress ES6UnusedImports -->
<script lang="ts">
  import ConstraintTooltip from "$lib/components/elements/constraint/lib/constraint-tooltip.svelte";
  import { ChipVariant } from "$lib/components/ui/chip";
  import Chip from "$lib/components/ui/chip/chip.svelte";
  import Icon from "$lib/components/ui/icon/icon.svelte";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { type Constraint, type ConstraintOperand } from "$lib/types/constraints.ts";
  import { DraftingCompassIcon, PlusIcon } from "lucide-svelte";

  import { getIcon } from "./lib/utils.ts";

  let constraint: Constraint | undefined;
  let forOperand: ConstraintOperand | undefined = undefined;
  let popoverEnabled: boolean = true;
  let variant: ChipVariant = ChipVariant.default;
  let placeholder: string = "No constraint selected";
  let className: string = "";

  const assignedVariant: ChipVariant = ChipVariant.destructiveOutline;
  $: icon = {
    color: undefined,
    icon: getIcon(constraint, forOperand)
  };

  // noinspection ReservedWordAsName
  export { className as class, constraint, forOperand, placeholder, popoverEnabled, variant };
</script>

<Tooltip.Root>
  <Tooltip.Trigger>
    {#if constraint === undefined}
      <Chip class={className} {variant}>
        <DraftingCompassIcon class="h-5 w-5" slot="icon" />
        <PlusIcon class="h-5 w-5" slot="hover_icon" />
      </Chip>
    {:else}
      <Chip class={className} variant={assignedVariant}>
        <Icon class="h-5 w-5" {icon} slot="icon" variant="monochrome" />
      </Chip>
    {/if}
  </Tooltip.Trigger>
  {#if popoverEnabled}
    <Tooltip.Content class="max-w-[250px] overflow-visible">
      {#if constraint}
        <ConstraintTooltip {constraint} {forOperand} />
      {:else}
        {placeholder}
      {/if}
    </Tooltip.Content>
  {/if}
</Tooltip.Root>
