<script lang="ts">
  import type { PropertyValues } from "$lib/model/core/property_values";
  import PropertyInput from "./property-input.svelte";

  export let properties: PropertyValues;
</script>

{#each properties.keys as property}
  <div class="flex flex-col gap-1.5">
    <span class="font-semibold">{property.name}</span>
    <PropertyInput {properties} {property} />
  </div>
{/each}
