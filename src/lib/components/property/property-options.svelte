<script lang="ts">
  import { ProfilesList } from "$lib/components/profile";
  import { Property } from "$lib/model";
  import { ASelectProperty, TextProperty } from "$lib/model/core/property";

  export let property: Property<unknown>;
</script>

{#if property instanceof ASelectProperty}
  {#if property.options.length > 0}
    <ProfilesList items={property.options} />
  {:else}
    <span class="text-muted-foreground">No options configured</span>
  {/if}
{:else if property instanceof TextProperty}
  <!-- Text Field -->
{/if}
