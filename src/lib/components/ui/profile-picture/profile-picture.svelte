<script lang="ts" generics="T extends Display">
  import { Chip } from "../chip";

  import * as Avatar from "$lib/components/ui/avatar";
  import IconElement from "$lib/components/ui/icon/icon.svelte";
  import { Icon, type Display } from "$lib/backend/ui";
  import { misc } from "$lib/backend/utils";
  import { PFP_HEIGHT, PFP_WIDTH, type Size } from ".";

  let item: T | undefined = undefined;
  let size: Size = "md";
  let defaultIcon: Icon | undefined = undefined;
  let emptyIcon: Icon | undefined = undefined;
  let className: string = "";

  $: width = PFP_WIDTH[size];
  $: height = PFP_HEIGHT[size];

  export { className as class, item, size, hover, defaultIcon, emptyIcon };
</script>

{#if item}
  {#if item.avatar}
    <Avatar.Root class="outline-none hover:outline-accent-foreground {width} {height} {className}">
      <Avatar.Image alt={item.name} src={item.avatar.href} class="rounded-full" />
      <Avatar.Fallback>{misc.getInitials(item.name)}</Avatar.Fallback>
    </Avatar.Root>
  {:else if item.icon}
    <Chip {size} color={item.icon.color} variant="outline" class="m-0.5 {className}">
      <IconElement slot="icon" icon={item.icon} />
    </Chip>
  {:else if defaultIcon}
    <Chip {size} color={defaultIcon.color} variant="outline" class="m-0.5 {className}">
      <IconElement slot="icon" icon={defaultIcon} />
    </Chip>
  {/if}
{:else if emptyIcon}
  <Chip {size} color={emptyIcon.color} variant="outline" class="m-0.5 {className}">
    <IconElement slot="icon" icon={emptyIcon} />
  </Chip>
{:else if defaultIcon}
  <Chip {size} color={defaultIcon.color} variant="outline" class="m-0.5 {className}">
    <IconElement slot="icon" icon={defaultIcon} />
  </Chip>
{/if}
