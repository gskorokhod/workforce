<!--suppress ES6UnusedImports -->
<script lang="ts" generics="T">
  import { Button } from "$lib/components/ui/button";
  import * as Command from "$lib/components/ui/command";
  import Profile from "$lib/components/profile/profile.svelte";
  import * as Popover from "$lib/components/ui/popover";
  import { Icon, type Display } from "$lib/ui";
  import { cn } from "$lib/utils/ui";
  import Check from "lucide-svelte/icons/check";
  import ChevronDownIcon from "lucide-svelte/icons/chevron-down";
  import { tick } from "svelte";

  export let display: (val: T | undefined) => Display | undefined;
  export let getId: (val: T) => string;
  export let eq: (a: T | undefined, b: T | undefined) => boolean = (a, b) => {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return getId(a) === getId(b);
  };
  export let onChange: (aOld: T | undefined, aNew: T | undefined) => void = () => {};
  export let onSelect: (val: T | undefined) => void = () => {};
  export let open = false;
  export let allowUnselect = true;
  export let value: T | undefined = undefined;
  export let placeholder: string | undefined = undefined;
  export let options: T[] = [];
  let className = "";

  // We want to refocus the trigger button when the user selects
  // an item from the list so users can continue navigating the
  // rest of the form with the keyboard.
  function closeAndFocusTrigger(triggerId: string) {
    open = false;
    tick().then(() => {
      document.getElementById(triggerId)?.focus();
    });
  }

  export { className as class };
</script>

<Popover.Root bind:open let:ids>
  <Popover.Trigger asChild let:builder>
    <Button
      builders={[builder]}
      variant="outline"
      role="combobox"
      aria-expanded={open}
      class="justify-between p-2 {className}"
    >
      <Profile
        item={display(value)}
        variant="full"
        hoverEffects={false}
        showTooltip={false}
        {placeholder}
      />
      <ChevronDownIcon
        class="mr-1.5 text-muted-foreground transition-all group-hover/selector:text-foreground {open
          ? 'rotate-180'
          : ''}"
      />
    </Button>
  </Popover.Trigger>
  <Popover.Content class="overflow-visible p-2">
    <Command.Root class="overflow-visible">
      <Command.Input placeholder="Search" />
      <Command.Empty>No options found</Command.Empty>
      <Command.Group class="overflow-visible">
        {#if allowUnselect}
          <Command.Item
            class="overflow-visible"
            value={undefined}
            onSelect={() => {
              onChange(value, undefined);
              onSelect(undefined);
              value = undefined;
              closeAndFocusTrigger(ids.trigger);
            }}
          >
            <Profile
              class="gap-3"
              emptyIcon={Icon.fromString("lucide:x")}
              {placeholder}
              item={display(undefined)}
              variant="full"
              hoverEffects={false}
              showTooltip={false}
            />
            <Check class={cn("ml-auto h-5 w-5", !eq(value, undefined) && "text-transparent")} />
          </Command.Item>
        {/if}
        {#each options as option}
          <Command.Item
            class="overflow-visible"
            value={getId(option)}
            onSelect={() => {
              onChange(value, option);
              onSelect(option);
              value = option;
              closeAndFocusTrigger(ids.trigger);
            }}
          >
            <Profile
              class="gap-3"
              item={display(option)}
              variant="full"
              hoverEffects={false}
              showTooltip={false}
            />
            <Check class={cn("ml-auto h-5 w-5", !eq(value, option) && "text-transparent")} />
          </Command.Item>
        {/each}
      </Command.Group>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
