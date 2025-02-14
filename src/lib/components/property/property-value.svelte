<script lang="ts" generics="T">
  import { Profile, ProfilesList } from "$lib/components/profile";
  import { Property } from "$lib/model";
  import { MultiSelectProperty, SelectProperty, TextProperty } from "$lib/model/core/property";

  export let property: Property<T>;
  export let value: unknown | undefined;
</script>

{#if property instanceof SelectProperty}
  {#if value}
    <Profile item={property.parse(value).data} />
  {:else}
    <span class="text-muted-foreground">Not set</span>
  {/if}
{:else if property instanceof MultiSelectProperty}
  {#if value}
    <ProfilesList items={property.parse(value).data} />
  {:else}
    <span class="text-muted-foreground">Not set</span>
  {/if}
{:else if property instanceof TextProperty}
  {#if value}
    <span>{property.parse(value).data}</span>
  {:else}
    <span class="text-muted-foreground">Not set</span>
  {/if}
{:else}
  <span class="text-muted-foreground">Unsupported property type</span>
{/if}
