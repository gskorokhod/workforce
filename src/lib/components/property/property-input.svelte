<script lang="ts">
  import { Selector, SelectorMany } from "$lib/components/selector";
  import { Input } from "$lib/components/ui/input";
  import {
    MultiSelectProperty,
    Property,
    SelectProperty,
    TextProperty,
  } from "$lib/model/core/property";
  import type { PropertyValues } from "$lib/model/core/property_values";

  export let properties: PropertyValues;
  export let property: Property<unknown>;

  function putInputValue(property: Property<unknown>, e: Event) {
    properties.put(property, (e.target as HTMLInputElement)?.value);
  }
</script>

{#if properties.has(property)}
  {#if property instanceof SelectProperty}
    {@const val = properties.get(property) || undefined}
    <Selector
      variant="full"
      value={val}
      options={property.options}
      onSelected={(v) => {
        console.log("--SELECTOR: Putting value", v);
        properties.put(property, v);
      }}
      placeholderIcon={property.icon?.with({ color: null })}
      {...$$restProps}
    />
  {:else if property instanceof MultiSelectProperty}
    {@const val = properties.get(property) || []}
    <SelectorMany
      variant="full"
      value={val}
      options={property.options}
      onChanged={(v) => properties.put(property, v)}
      placeholderIcon={property.icon?.with({ color: null })}
      plusIcon={property.icon?.with({ color: null })}
      {...$$restProps}
    />
  {:else if property instanceof TextProperty}
    {@const val = properties.get(property) || ""}
    <Input value={val} on:change={(e) => putInputValue(property, e)} />
  {:else}
    <span class="text-muted-foreground">Unsupported property type</span>
  {/if}
{:else}
  <span class="text-muted-foreground">No property selected</span>
{/if}
