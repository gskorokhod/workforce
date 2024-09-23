<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { ColorPicker } from "$lib/components/ui/color-picker";
  import { Icon } from "$lib/components/ui/icon";
  import { Search } from "$lib/components/ui/search";
  import { Separator } from "$lib/components/ui/separator";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { Icon as TIcon } from "$lib/model/ui";
  import { capitalize } from "$lib/utils/utils";
  import type Color from "color";
  import { LoaderIcon } from "lucide-svelte";
  import { writable, type Writable } from "svelte/store";

  const LIMIT: number = 64;
  const ICON_SET: string = "mdi";
  const DEFAULT_ICONS: TIcon[] = [
    TIcon.fromString("mdi:doctor"),
    TIcon.fromString("mdi:translate"),
    TIcon.fromString("mdi:account"),
    TIcon.fromString("mdi:sign-language"),
    TIcon.fromString("mdi:wheelchair"),
    TIcon.fromString("mdi:laptop"),
    TIcon.fromString("mdi:car"),
    TIcon.fromString("mdi:airplane"),
    TIcon.fromString("mdi:home"),
    TIcon.fromString("mdi:food"),
    TIcon.fromString("mdi:atom"),
    TIcon.fromString("mdi:lightbulb"),
    TIcon.fromString("mdi:heart"),
    TIcon.fromString("mdi:briefcase"),
    TIcon.fromString("mdi:book"),
    TIcon.fromString("mdi:camera"),
    TIcon.fromString("mdi:briefcase")
  ];

  export let icon: TIcon | undefined = undefined;
  export let onClose: () => void = () => {};

  let className: string = "";
  let color: Color | undefined = icon?.color;
  let loading: boolean = false;
  let iconList: Writable<TIcon[]> = writable(DEFAULT_ICONS);

  async function fetchIconList(query: string) {
    loading = true;
    try {
      const response = await fetch(
        `https://api.iconify.design/search?query=${query}&prefix=${ICON_SET}&limit=${LIMIT}`
      );
      const data = await response.json();
      iconList.set(data.icons.map((icon: string) => TIcon.fromString(icon)));
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

  function onColorSelect(c: Color) {
    color = c;
    icon = icon?.with({ color });
  }

  export { className as class };
</script>

<div class="flex flex-col {className}">
  <Button
    class="h-0 w-0 opacity-0"
    variant="ghost"
    on:click={onClose}
    aria-label="Close icon picker popup"
  >
    Close
  </Button>

  <ColorPicker class="mb-4 mt-2 justify-center" {color} onSelect={onColorSelect} />

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
    <div class="flex max-h-[300px] w-full flex-row flex-wrap overflow-y-scroll p-2">
      {#each $iconList as option}
        <Tooltip.Root openDelay={50}>
          <Tooltip.Trigger asChild let:builder>
            <Button
              on:click={() => {
                icon = option.with({ color });
                onClose();
              }}
              builders={[builder]}
              size="icon"
              variant="ghost"
              class="text-xl"
            >
              <Icon class="text-primary transition-all" icon={option} color={icon?.color} />
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content>
            {capitalize(option.icon.name)}
          </Tooltip.Content>
        </Tooltip.Root>
      {/each}
    </div>
  {/if}
</div>
