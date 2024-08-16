<!--suppress ES6UnusedImports -->
<script lang="ts">
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import Chip from "$lib/components/ui/chip/chip.svelte";
  import type { Location } from "$lib/types";
  import { MapPinIcon, PlusIcon } from "lucide-svelte";
  import { ChipVariant } from "$lib/components/ui/chip";
  import { capitalize, getInitials } from "$lib/utils/utils.ts";

  let location: Location | undefined = undefined;
  let placeholder: string = "Unassigned";
  let variant: ChipVariant = ChipVariant.default;
  let compact: boolean = true;
  let popoverEnabled: boolean = true;
  let className: string = "";

  // noinspection ReservedWordAsName
  export { location, placeholder, compact, popoverEnabled, variant, className as class };
</script>


<Tooltip.Root>
  <Tooltip.Trigger>
    {#if location}
      {#if compact}
        <Chip class="{className} !p-0">
          <Avatar.Root class="h-10 w-10" slot="icon">
            <Avatar.Image src={location.image_url} alt={location.name} />
            <Avatar.Fallback>{getInitials(location.name)}</Avatar.Fallback>
          </Avatar.Root>
        </Chip>
      {:else }
        <Chip class={className}>
          <Avatar.Root class="h-10 w-10" slot="icon">
            <Avatar.Image src={location.image_url} alt={location.name} />
            <Avatar.Fallback>{getInitials(location.name)}</Avatar.Fallback>
          </Avatar.Root>
          {capitalize(location.name)}
        </Chip>
      {/if}
    {:else}
      {#if compact}
        <Chip class={className} {variant}>
          <MapPinIcon slot="icon" />
          <PlusIcon slot="hover_icon" />
        </Chip>
      {:else}
        <Chip class={className} {variant}>
          <MapPinIcon slot="icon" />
          <PlusIcon slot="hover_icon" />
          {capitalize(placeholder)}
        </Chip>
      {/if}
    {/if}
  </Tooltip.Trigger>
  {#if popoverEnabled}
    <Tooltip.Content class="max-w-[200px]">
      {#if location}
        <h3 class="font-semibold">{location.name}</h3>
        <p class="text-muted-foreground">{location.address}</p>
      {:else}
        {placeholder}
      {/if}
    </Tooltip.Content>
  {/if}
</Tooltip.Root>
