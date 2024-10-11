<script lang="ts" generics="T extends Base & Display">
  import * as Command from "$lib/components/ui/command";
  import * as Popover from "$lib/components/ui/popover";
  import { Base } from "$lib/backend/core";
  import { Icon, type Display } from "$lib/backend/ui";
  import { tick } from "svelte";
  import { type Size } from "../profile-picture";
  import { CLEAR, PLACEHOLDER, type OptionsCmp, type OptionsFilter } from "./misc";
  import SelectorEntry from "./selector-entry.svelte";

  export let open: boolean = false;
  export let options: T[] = [];
  export let size: Size = "md";
  export let placeholderIcon: Icon = PLACEHOLDER;
  export let clearIcon: Icon = CLEAR;
  export let allowUnselect: boolean = true;
  export let optionsCmp: OptionsCmp<T> = () => 0;
  export let optionsFilter: OptionsFilter<T> = () => true;
  export let onSelect: (value: T | undefined) => void = () => {};
  export let isChecked: (value: T | undefined) => boolean;
  export let className: string = "";

  $: _options = options.filter(optionsFilter).sort(optionsCmp);

  function closeAndFocusTrigger(triggerId: string) {
    open = false;
    tick().then(() => {
      document.getElementById(triggerId)?.focus();
    });
  }
</script>

<Popover.Root bind:open let:ids>
  <slot />
  <Popover.Content class="w-[250px] p-0 {className}">
    <Command.Root>
      <Command.Input placeholder="Search" />
      <Command.Empty>No items found</Command.Empty>
      <Command.Group class="max-h-[250px] overflow-y-scroll">
        {#each _options as option}
          <SelectorEntry
            {...{
              option,
              size,
              placeholderIcon,
              isChecked,
              onSelect: () => {
                onSelect(option);
                closeAndFocusTrigger(ids.trigger);
              }
            }}
          />
        {/each}
        {#if allowUnselect}
          <SelectorEntry
            {...{
              option: undefined,
              size,
              placeholderIcon: clearIcon,
              isChecked,
              onSelect: () => {
                onSelect(undefined);
                closeAndFocusTrigger(ids.trigger);
              }
            }}
          />
        {/if}
      </Command.Group>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
