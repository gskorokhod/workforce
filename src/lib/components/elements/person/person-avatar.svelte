<!--suppress ES6UnusedImports -->
<script lang="ts">
  import type { Person } from "$lib/types";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import * as Avatar from "$lib/components/ui/avatar";
  import Chip from "$lib/components/ui/chip/chip.svelte";
  import PersonTooltip from "$lib/components/elements/person/person-tooltip.svelte";
  import { PlusIcon, UserIcon } from "lucide-svelte";
  import { getInitialsForPerson } from "$lib/types/person.ts";
  import { ChipSize, ChipVariant } from "$lib/components/ui/chip";

  let person: Person | undefined = undefined;
  let popoverEnabled: boolean = true;
  let placeholder: string = "Unassigned";
  let variant: ChipVariant = ChipVariant.default;
  let className: string = "";

  // noinspection ReservedWordAsName
  export { person, placeholder, popoverEnabled, variant, className as class };
</script>

<Tooltip.Root>
  <Tooltip.Trigger>
    {#if person}
      <Chip {variant} class="{className} !p-0" size={ChipSize.lg}>
        <Avatar.Root slot="icon" class="w-10 h-10">
          <Avatar.Image src={person.image_url} alt={person.name} />
          <Avatar.Fallback>{getInitialsForPerson(person)}</Avatar.Fallback>
        </Avatar.Root>
      </Chip>
    {:else }
      <Chip {variant} class="{className} !p-1" size={ChipSize.lg}>
        <UserIcon slot="icon" class="w-8 h-8" />
        <PlusIcon slot="hover_icon" class="w-8 h-8" />
      </Chip>
    {/if}
  </Tooltip.Trigger>
  {#if popoverEnabled}
    <Tooltip.Content>
      {#if person}
        <PersonTooltip person={person} />
      {:else}
        {placeholder}
      {/if}
    </Tooltip.Content>
  {/if}
</Tooltip.Root>
