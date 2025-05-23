<script lang="ts">
  import { ProfilesList } from "$lib/components/profile";
  import { Property } from "$lib/model";
  import { ASelectProperty, TextProperty } from "$lib/model/core/property";
  import { Icon } from "$lib/ui";

  export let property: Property<unknown>;
</script>

{#if property instanceof ASelectProperty}
  {#if property.options.length > 0}
    <ProfilesList items={property.options} defaultIcon={Icon.fromString("lucide:tag")} />
  {:else}
    <span class="text-muted-foreground">No options configured</span>
  {/if}
{:else if property instanceof TextProperty}
  <span class="text-muted-foreground">Freeform text field</span>
{/if}
