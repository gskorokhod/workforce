<!--suppress ES6UnusedImports -->
<script lang="ts">
  import type { Skill } from "$lib/types";

  import { ChipVariant } from "$lib/components/ui/chip";
  import Chip from "$lib/components/ui/chip/chip.svelte";
  import Icon from "$lib/components/ui/icon/icon.svelte";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { capitalize } from "$lib/utils/utils.js";
  import { GraduationCapIcon, PlusIcon } from "lucide-svelte";

  let skill: Skill | undefined;
  let placeholder: string = "No skill selected";
  let variant: ChipVariant = ChipVariant.default;
  let popoverEnabled: boolean = true;
  let compact: boolean = true;
  let className: string = "";

  // noinspection ReservedWordAsName
  export { className as class, compact, placeholder, popoverEnabled, skill, variant };
</script>

<Tooltip.Root>
  <Tooltip.Trigger>
    {#if skill}
      {#if compact}
        <Chip class={className} color={skill.icon.color} variant={ChipVariant.colorOutline}>
          <Icon class="h-5 w-5" icon={skill.icon} slot="icon" variant="monochrome" />
        </Chip>
      {:else}
        <Chip class={className} color={skill.icon.color} variant={ChipVariant.colorSolid}>
          <Icon class="h-5 w-5" icon={skill.icon} slot="icon" variant="monochrome" />
          {capitalize(skill.name)}
        </Chip>
      {/if}
    {:else if compact}
      <Chip class={className} {variant}>
        <GraduationCapIcon slot="icon" />
        <PlusIcon slot="hover_icon" />
      </Chip>
    {:else}
      <Chip class={className} {variant}>
        <GraduationCapIcon slot="icon" />
        <PlusIcon slot="hover_icon" />
        {capitalize(placeholder)}
      </Chip>
    {/if}
  </Tooltip.Trigger>
  {#if popoverEnabled}
    <Tooltip.Content class="max-w-[250px]">
      {#if skill}
        <h3>{capitalize(skill.name)}</h3>
        <p class="text-muted-foreground">{skill.description}</p>
      {:else}
        {placeholder}
      {/if}
    </Tooltip.Content>
  {/if}
</Tooltip.Root>
