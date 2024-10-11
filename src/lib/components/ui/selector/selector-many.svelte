<script lang="ts" generics="T extends Base & Display">
  import { Button } from "$lib/components/ui/button";
  import * as Popover from "$lib/components/ui/popover";
  import { Base } from "$lib/backend/core";
  import { Icon, type Display } from "$lib/backend/ui";
  import { has, without } from "$lib/backend/utils";
  import { ChevronDownIcon } from "lucide-svelte";
  import { type Size } from "../profile-picture";
  import ProfilesList from "../profile-picture/profiles-list.svelte";
  import { BTN_SIZE, PLACEHOLDER, PLUS, type OptionsCmp, type OptionsFilter } from "./misc";
  import SelectorBase from "./selector-base.svelte";

  export let value: T[] = [];
  export let options: T[] = [];
  export let variant: "compact" | "default" | "text" | "full" = "default";
  export let size: Size = "md";
  export let plusIcon: Icon = PLUS;
  export let placeholderIcon: Icon = PLACEHOLDER;
  export let placeholderText: string = "Select";
  export let id: string | undefined = undefined;
  export let optionsCmp: OptionsCmp<T> = () => 0;
  export let valuesCmp: OptionsCmp<T> = (a, b) => a.name.localeCompare(b.name);
  export let onChanged: (value: T[]) => void = () => {};
  export let optionsFilter: OptionsFilter<T> = () => true;

  let className: string = "";
  let open: boolean = false;

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
    className
  }}
  bind:open
>
  <Popover.Trigger asChild let:builder>
    <Button
      {id}
      aria-expanded={open}
      builders={[builder]}
      class="group/selector !h-max w-max px-2 py-2 {BTN_SIZE[
        size
      ]} overflow-visible rounded-full outline-none hover:outline-accent-foreground"
      role="combobox"
      variant="ghost"
    >
      <ProfilesList
        {variant}
        items={value}
        placeholder={placeholderText}
        emptyIcon={plusIcon}
        defaultIcon={placeholderIcon}
      />

      <ChevronDownIcon
        class="transition-all {open && 'rotate-180'} {variant === 'compact' && 'ml-5'}"
      />
    </Button>
  </Popover.Trigger>
</SelectorBase>
