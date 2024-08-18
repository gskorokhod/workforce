<script lang="ts">
  import ConstraintBadge from "$lib/components/elements/constraint/constraint-badge.svelte";
  import { getConstraintsFor } from "$lib/stores.ts";
  import { type ConstraintOperand } from "$lib/types/constraints.ts";

  let forOperand: ConstraintOperand;
  let placeholder: string = "No constraints";

  $: constraints = getConstraintsFor(forOperand);

  export { forOperand };
</script>

{#if constraints.length > 0}
  <div class="flex flex-row flex-wrap items-center justify-start gap-2">
    {#each constraints as constraint}
      <ConstraintBadge {constraint} {forOperand} />
    {/each}
  </div>
{:else}
  <div class="text-accent-foreground">{placeholder}</div>
{/if}
