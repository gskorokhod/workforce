<!--suppress ES6UnusedImports -->
<script lang="ts">
  import type { IconType } from "$lib/types/ui.ts";

  import { Button } from "$lib/components/ui/button";
  import { ChipVariant } from "$lib/components/ui/chip"; import Chip from "$lib/components/ui/chip/chip.svelte";
  import ColourPicker from "$lib/components/ui/color-picker/color-picker.svelte";
  import Icon from "$lib/components/ui/icon/icon.svelte";
  import * as Popover from "$lib/components/ui/popover";
  import Search from "$lib/components/ui/search/search.svelte";
  import { Separator } from "$lib/components/ui/separator";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { capitalize, stripPrefix } from "$lib/utils/utils.js";
  import { ChevronDownIcon, LoaderIcon } from "lucide-svelte";
  import { tick } from "svelte";
  import { type Writable,writable } from "svelte/store";

  const LIMIT: number = 64;
  const ICON_SET: string = "mdi";
  const DEFAULT_ICONS: string[] = [
    "mdi:account",
    "mdi:hospital",
    "mdi:home",
    "mdi:car",
    "mdi:food",
    "mdi:airplane",
    "mdi:briefcase",
    "mdi:camera",
    "mdi:book",
    "mdi:heart",
    "mdi:factory",
    "mdi:fire",
    "mdi:flower",
    "mdi:computer",
    "mdi:language",
    "mdi:dropbox",
    "mdi:code",
    "mdi:wrench",
    "mdi:shield",
    "mdi:lock",
    "mdi:lightbulb",
    "mdi:power-plug",
    "mdi:phone",
    "mdi:email",
    "mdi:map",
    "mdi:weather-sunny",
    "mdi:weather-night",
    "mdi:paw"
  ];

  let open: boolean = false;
  let className: string = "";
  let iconList: Writable<string[]> = writable(DEFAULT_ICONS);
  let icon: IconType | undefined = undefined;
  let loading: boolean = false;

  function onColourSelect(color: string) {
    icon = {
      color: color,
      icon: icon?.icon ?? ""
    };
  }

  async function fetchIconList(query: string) {
    loading = true;
    try {
      const response = await fetch(
        `https://api.iconify.design/search?query=${query}&prefix=${ICON_SET}&limit=${LIMIT}`
      );
      const data = await response.json();
      iconList.set(data.icons);
    } catch (error) {
      console.error("Error fetching icon list", error);
      iconList.set([]);
    } finally {
      loading = false;
    }
  }

  async function onSearch(query: string) {
    if (query === "") {
      iconList.set(DEFAULT_ICONS);
      return;
    }

    await fetchIconList(query);
  }

  // We want to refocus the trigger button when the user selects
  // an item from the list so users can continue navigating the
  // rest of the form with the keyboard.
  function closeAndFocusTrigger(triggerId: string) {
    open = false;
    tick().then(() => {
      document.getElementById(triggerId)?.focus();
    });
  }

  export { className as class,icon };
</script>

<Popover.Root bind:open let:ids>
  <Popover.Trigger asChild class={className} let:builder>
    <Button
      aria-expanded={open}
      builders={[builder]}
      class="h-fit w-fit rounded-full p-0 outline-none"
      role="combobox"
      size="icon_lg"
      variant="ghost"
    >
      {#if icon === undefined || icon.icon === ""}
        <Chip variant={ChipVariant.outline}>
          <ChevronDownIcon class="h-5 w-5" slot="icon" />
        </Chip>
      {:else}
        <Chip color={icon.color} variant={ChipVariant.colorOutline}>
          <Icon class="h-5 w-5" {icon} slot="icon" variant="monochrome" />
        </Chip>
      {/if}
    </Button>
  </Popover.Trigger>
  <Popover.Content class="w-[310px] p-0">
    <ColourPicker
      class="mb-4 mt-4 justify-center"
      color={icon?.color}
      onSelect={(c) => onColourSelect(c)}
    />

    <Separator orientation="horizontal" />

    <Search class="!rounded-none !border-none !shadow-none" onInput={onSearch} />

    <Separator orientation="horizontal" />

    {#if loading}
      <div class="flex h-20 w-full flex-row items-center justify-center">
        <LoaderIcon class="animate-spin" />
      </div>
    {:else if $iconList.length === 0}
      <div class="flex h-20 w-full flex-row items-center justify-center text-muted-foreground">
        No icons found
      </div>
    {:else}
      <div class="my-2 flex max-h-[300px] w-full flex-row flex-wrap overflow-y-scroll">
        {#each $iconList as icon_name}
          <Tooltip.Root>
            <Tooltip.Trigger>
              <Button
                on:click={() => {
                  icon = {
                    color: icon?.color,
                    icon: icon_name
                  };
                  closeAndFocusTrigger(ids.trigger);
                }}
                size="icon_lg"
                variant="ghost"
              >
                <Icon
                  class="text-primary transition-all"
                  icon={{
                    color: icon?.color,
                    icon: icon_name
                  }}
                />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content class="text-muted-foreground">
              {capitalize(stripPrefix(icon_name, "mdi:").replaceAll("-", " "))}
            </Tooltip.Content>
          </Tooltip.Root>
        {/each}
      </div>
    {/if}
  </Popover.Content>
</Popover.Root>
