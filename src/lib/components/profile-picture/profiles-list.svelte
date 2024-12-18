<script lang="ts" generics="T extends Display">
  import { Icon, type Display } from "$lib/ui";
  import { PFP_HEIGHT, PFP_WIDTH, Profile, type ProfileSize, type Size } from ".";

  const COMPACT_WIDTH: ProfileSize = {
    xs: "w-2 hover:w-3",
    sm: "w-3 hover:w-4",
    md: "w-4 hover:w-5",
    lg: "w-5 hover:w-6",
    xl: "w-8 hover:w-10",
  };

  export let items: T[] = [];
  export let size: Size = "md";
  export let variant: "compact" | "default" | "text" | "full" = "default";
  export let max: number | undefined = undefined;
  export let defaultIcon: Icon | undefined = undefined;
  export let emptyIcon: Icon | undefined = undefined;
  export let placeholder: string;
  let className = "";

  export { className as class };
</script>

{#if variant === "compact"}
  {#if items.length > 0}
    <div class="group flex flex-row flex-wrap items-center justify-start {className}">
      {#each items.slice(0, max) as item}
        <div
          class="relative h-full transition-all hover:z-20 hover:!opacity-100 group-hover:opacity-55 {COMPACT_WIDTH[
            size
          ]} {PFP_HEIGHT[size]}"
        >
          <Profile
            variant="default"
            {item}
            {size}
            {defaultIcon}
            {emptyIcon}
            {placeholder}
            class="absolute left-0 top-0"
          />
          <!-- <PersonAvatar class="absolute left-0 top-0 h-10 w-10" {person} /> -->
        </div>
      {/each}
      {#if max && items.length > max}
        <div
          class="relative h-full transition-all hover:z-20 hover:!opacity-100 group-hover:opacity-55 {COMPACT_WIDTH[
            size
          ]} {PFP_HEIGHT[size]}"
        >
          <div
            class="absolute left-0 top-0 flex items-center justify-center rounded-full bg-accent text-accent-foreground {PFP_WIDTH[
              size
            ]} {PFP_HEIGHT[size]}"
          >
            +{items.length - max}
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <Profile variant="default" item={undefined} {size} {emptyIcon} {placeholder} />
  {/if}
{:else if items.length > 0}
  <div class="flex flex-row flex-wrap items-center justify-start gap-2 {className}">
    {#each items.slice(0, max) as item}
      <Profile {variant} {item} {size} {defaultIcon} {emptyIcon} {placeholder} />
    {/each}
    {#if max && items.length > max}
      <div
        class="flex items-center justify-center rounded-full bg-accent text-accent-foreground {PFP_WIDTH[
          size
        ]} {PFP_HEIGHT[size]}"
      >
        +{items.length - max}
      </div>
    {/if}
  </div>
{:else}
  <Profile {variant} item={undefined} {size} {emptyIcon} {placeholder} />
{/if}
