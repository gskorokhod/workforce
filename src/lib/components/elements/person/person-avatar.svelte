<!--suppress ES6UnusedImports -->
<script lang="ts">
  import type { Person } from "$lib/types";

  import PersonTooltip from "$lib/components/elements/person/person-tooltip.svelte";
  import * as Avatar from "$lib/components/ui/avatar";
  import { ChipSize, ChipVariant } from "$lib/components/ui/chip";
  import Chip from "$lib/components/ui/chip/chip.svelte";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { getInitialsForPerson } from "$lib/types/person.ts";
  import { PlusIcon, UserIcon } from "lucide-svelte";

  let person: Person | undefined = undefined;
  let popoverEnabled: boolean = true;
  let placeholder: string = "Unassigned";
  let variant: ChipVariant = ChipVariant.default;
  let className: string = "";

  // noinspection ReservedWordAsName
  export { className as class, person, placeholder, popoverEnabled, variant };
</script>

<Tooltip.Root>
  <Tooltip.Trigger>
    {#if person}
      <Chip class="{className} !p-0" size={ChipSize.lg} {variant}>
        <Avatar.Root class="h-10 w-10" slot="icon">
          <Avatar.Image alt={person.name} src={person.image_url} />
          <Avatar.Fallback>{getInitialsForPerson(person)}</Avatar.Fallback>
        </Avatar.Root>
      </Chip>
    {:else}
      <Chip class="{className} !p-1" size={ChipSize.lg} {variant}>
        <UserIcon class="h-8 w-8" slot="icon" />
        <PlusIcon class="h-8 w-8" slot="hover_icon" />
      </Chip>
    {/if}
  </Tooltip.Trigger>
  {#if popoverEnabled}
    <Tooltip.Content>
      {#if person}
        <PersonTooltip {person} />
      {:else}
        {placeholder}
      {/if}
    </Tooltip.Content>
  {/if}
</Tooltip.Root>
