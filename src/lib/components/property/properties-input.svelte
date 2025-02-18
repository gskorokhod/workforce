<script lang="ts">
  import { Selector, SelectorMany } from "$lib/components/selector";
  import { Input } from "$lib/components/ui/input";
  import { WithProperties } from "$lib/model/core";
  import {
    MultiSelectProperty,
    Property,
    SelectProperty,
    TextProperty,
  } from "$lib/model/core/property";

  export let item: WithProperties;

  function putInputValue(property: Property<unknown>, e: Event) {
    item.properties.put(property, (e.target as HTMLInputElement)?.value);
  }
</script>

{#each item.properties.keys as property}
  <div class="flex flex-col gap-1.5">
    <span class="font-semibold">{property.name}</span>
    {#if property instanceof SelectProperty}
      {@const val = item.properties.get(property) || undefined}
      <Selector
        variant="full"
        value={val}
        options={property.options}
        onSelected={(v) => {
          console.log("--SELECTOR: Putting value", v);
          item.properties.put(property, v);
        }}
      />
    {:else if property instanceof MultiSelectProperty}
      {@const val = item.properties.get(property) || []}
      <SelectorMany
        variant="full"
        value={val}
        options={property.options}
        onChanged={(v) => item.properties.put(property, v)}
      />
    {:else if property instanceof TextProperty}
      {@const val = item.properties.get(property) || ""}
      <Input value={val} on:change={(e) => putInputValue(property, e)} />
    {:else}
      <span class="text-muted-foreground">Unsupported property type</span>
    {/if}
  </div>
{/each}
