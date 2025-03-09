<script lang="ts" generics="T">
  import { Profile, ProfilesList } from "$lib/components/profile";
  import { Property } from "$lib/model";
  import { MultiSelectProperty, SelectProperty, TextProperty } from "$lib/model/core/property";

  export let property: Property<T>;
  export let value: unknown | undefined;

  function isTruthy(value: unknown | undefined): boolean {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return !!value;
  }
</script>

{#if property instanceof SelectProperty}
  {#if isTruthy(value)}
    <Profile item={property.parse(value).data} />
  {:else}
    <span class="text-muted-foreground">Not set</span>
  {/if}
{:else if property instanceof MultiSelectProperty}
  {#if isTruthy(value)}
    <ProfilesList items={property.parse(value).data} />
  {:else}
    <span class="text-muted-foreground">Not set</span>
  {/if}
{:else if property instanceof TextProperty}
  {#if isTruthy(value)}
    <span>{property.parse(value).data}</span>
  {:else}
    <span class="text-muted-foreground">Not set</span>
  {/if}
{:else}
  <span class="text-muted-foreground">Unsupported property type</span>
{/if}
