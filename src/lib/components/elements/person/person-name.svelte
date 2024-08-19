<!--suppress ES6UnusedImports -->
<script lang="ts">
  import type { Person } from "$lib/types";

  import PersonTooltip from "$lib/components/elements/person/person-tooltip.svelte";
  import * as Avatar from "$lib/components/ui/avatar";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { getInitialsForPerson } from "$lib/types/person.ts";

  let person: Person;
  let popoverEnabled: boolean = true;
  let showAvatar: boolean = true;
  let className: string = "";

  export { className, person, popoverEnabled, showAvatar };
</script>

<Tooltip.Root>
  <Tooltip.Trigger class="align-middle underline {className}">
    {#if showAvatar}
      <Avatar.Root class="mr-1 inline-flex h-5 w-5 rounded-full align-middle">
        <Avatar.Image alt={person.name} src={person.image_url} />
        <Avatar.Fallback>{getInitialsForPerson(person)}</Avatar.Fallback>
      </Avatar.Root>
    {/if}
    <b>{person.name}</b>
  </Tooltip.Trigger>
  {#if popoverEnabled}
    <Tooltip.Content>
      <PersonTooltip {person} />
    </Tooltip.Content>
  {/if}
</Tooltip.Root>
