<script lang="ts" generics="T extends Base & Display">
  import * as Command from "$lib/components/ui/command";
  import { Base } from "$lib/backend/core";
  import type { Display, Icon } from "$lib/backend/ui";
  import { Check } from "lucide-svelte";
  import { ProfilePicture, type Size } from "../profile-picture";
  import { PLACEHOLDER } from "./misc";

  export let option: T | undefined = undefined;
  export let showImage: boolean = true;
  export let showName: boolean = true;
  export let size: Size = "md";
  export let placeholderIcon: Icon = PLACEHOLDER;
  export let placeholderText: string = "Not Selected";
  export let className: string = "";
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
      class="!pointer-events-none !border-none !bg-transparent"
    />
  {/if}

  {#if showName}
    <span>{option?.name || placeholderText}</span>
  {/if}

  <Check class="ml-auto {isChecked(option) ? '' : 'text-transparent'}" />
</Command.Item>
