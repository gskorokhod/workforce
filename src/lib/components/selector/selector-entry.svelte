<script lang="ts" generics="T extends Display & HasUUID">
  import { type HasUUID } from "$lib/utils/misc";
  import * as Command from "$lib/components/ui/command";
  import type { Display, Icon } from "$lib/ui";
  import { Check } from "lucide-svelte";
  import { ProfilePicture, type Size } from "$lib/components/profile";
  import { PLACEHOLDER } from "./misc";

  export let option: T | undefined = undefined;
  export let showImage = true;
  export let showName = true;
  export let size: Size = "md";
  export let placeholderIcon: Icon = PLACEHOLDER;
  export let placeholderText = "Not Selected";
  export let className = "";
  export let isChecked: (value: T | undefined) => boolean;
  export let onSelect: () => void = () => {};
</script>

<Command.Item
  class="flex flex-row items-center justify-start gap-2 {className}"
  {onSelect}
  value={option ? `${option.name} (${option.uuid})` : ""}
>
  {#if showImage}
    <ProfilePicture
      item={option}
      defaultIcon={placeholderIcon}
      {size}
      class="!pointer-events-none"
    />
  {/if}

  {#if showName}
    <span>{option?.name || placeholderText}</span>
  {/if}

  <Check class="ml-auto {isChecked(option) ? '' : 'text-transparent'}" />
</Command.Item>
