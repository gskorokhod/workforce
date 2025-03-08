<script lang="ts" generics="T extends Display & HasUUID">
  import { ProfilesList, type Size } from "$lib/components/profile";
  import { Button } from "$lib/components/ui/button";
  import * as Popover from "$lib/components/ui/popover";
  import { Icon, type Display } from "$lib/ui";
  import { has, without } from "$lib/utils";
  import { type HasUUID } from "$lib/utils/misc";
  import { ChevronDownIcon } from "lucide-svelte";
  import { BTN_SIZE, PLACEHOLDER, PLUS, type OptionsCmp, type OptionsFilter } from "./misc";
  import SelectorBase from "./selector-base.svelte";

  export let value: T[] = [];
  export let options: T[] = [];
  export let variant: "compact" | "default" | "text" | "full" = "default";
  export let size: Size = "md";
  export let plusIcon: Icon = PLUS;
  export let placeholderIcon: Icon = PLACEHOLDER;
  export let placeholderText = "Select";
  export let id: string | undefined = undefined;
  export let optionsCmp: OptionsCmp<T> = () => 0;
  export let valuesCmp: OptionsCmp<T> = (a, b) => a.name.localeCompare(b.name);
  export let onChanged: (value: T[]) => void = () => {};
  export let optionsFilter: OptionsFilter<T> = () => true;

  let className = "";
  let open = false;

  $: isChecked = (option: T | undefined) => (option ? has(value, option) : false);
  $: onSelect = (option: T | undefined) => {
    if (option && has(value, option)) {
      value = without(value, option);
    } else if (option) {
      value = [...value, option];
    }
    value.sort(valuesCmp);
    onChanged(value);
  };

  export { className as class };
</script>

<SelectorBase
  {...{
    options,
    size,
    placeholderIcon,
    allowUnselect: false,
    optionsCmp,
    optionsFilter,
    onSelect,
    isChecked,
    className,
    closeOnSelect: false,
  }}
  bind:open
>
  <Popover.Trigger asChild let:builder>
    <Button
      {id}
      aria-expanded={open}
      builders={[builder]}
      class="group/selector !h-max w-max py-0.5 pl-0 pr-2 font-normal {BTN_SIZE[
        size
      ]} overflow-visible rounded-full outline-none transition-all hover:outline-accent-foreground {open &&
        'outline-accent-foreground'}"
      role="combobox"
      variant="ghost"
    >
      <ProfilesList
        {variant}
        items={value}
        placeholder={placeholderText}
        emptyIcon={plusIcon}
        defaultIcon={placeholderIcon}
        class="pr-0"
      />

      <ChevronDownIcon
        class="text-muted-foreground transition-all group-hover/selector:text-foreground {open &&
          'rotate-180'} {variant === 'compact' && 'ml-5'}"
      />
    </Button>
  </Popover.Trigger>
</SelectorBase>
