<script lang="ts" generics="T extends Base & Display">
  import { Button } from "$lib/components/ui/button";
  import * as Popover from "$lib/components/ui/popover";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { Base } from "$lib/model/core";
  import { Icon, type Display } from "$lib/ui";
  import { ChevronDownIcon } from "lucide-svelte";
  import { ProfilePicture, ProfileTooltip, type Size } from "../profile-picture";
  import {
    BTN_SIZE,
    PLACEHOLDER,
    type OnSelect,
    type OptionsCmp,
    type OptionsFilter,
    type TransitionFn,
  } from "./misc";
  import SelectorBase from "./selector-base.svelte";

  export let value: T | undefined = undefined;
  export let options: T[] = [];
  export let colors: "ghost" | "destructive" = "ghost";
  export let variant: "compact" | "default" | "text" | "full" = "default";
  export let size: Size = "md";
  export let placeholderIcon: Icon = PLACEHOLDER;
  export let placeholderText = "Not Selected";
  export let allowUnselect = true;
  export let id: string | undefined = undefined;
  export let transition: TransitionFn<T> = (_old, _new) => _new;
  export let optionsCmp: OptionsCmp<T> = () => 0;
  export let optionsFilter: OptionsFilter<T> = () => true;
  export let onSelected: OnSelect<T> = () => {};
  export let open = false;
  let className = "";

  $: isChecked = (option: T | undefined) => option === value;
  $: onSelect = (option: T | undefined) => {
    value = transition(value, option);
    onSelected(value);
  };
  $: showIcon = variant !== "compact";
  $: showImage = variant !== "text";
  $: showName = ["text", "full"].includes(variant);

  export { className as class };
</script>

<SelectorBase
  {...{
    options,
    size,
    placeholderIcon,
    allowUnselect,
    optionsCmp,
    optionsFilter,
    onSelect,
    isChecked,
  }}
  bind:open
>
  <Tooltip.Root>
    <Tooltip.Trigger class="w-max">
      <Popover.Trigger asChild let:builder={popoverTrigger}>
        <Button
          {id}
          aria-expanded={open}
          builders={[popoverTrigger]}
          class="group/selector !h-max !w-max {BTN_SIZE[
            size
          ]} overflow-visible rounded-full outline-none transition-all hover:outline-accent-foreground {variant ===
          'full'
            ? 'px-1.5 py-1'
            : 'p-0.5'} {variant === 'compact' && 'aspect-square !p-0'} {open &&
            'outline-accent-foreground'} {className}"
          role="combobox"
          variant={colors}
        >
          {#if showImage}
            <ProfilePicture item={value} class="!pointer-events-none" {size} />
          {/if}

          {#if showName}
            <span>{value?.name || placeholderText}</span>
          {/if}

          {#if showIcon}
            <ChevronDownIcon class="transition-all {open ? 'rotate-180' : ''}" />
          {/if}
        </Button>
      </Popover.Trigger>
    </Tooltip.Trigger>
    <Tooltip.Content>
      <ProfileTooltip item={value} />
    </Tooltip.Content>
  </Tooltip.Root>
</SelectorBase>
