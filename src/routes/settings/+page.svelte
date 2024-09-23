<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { populateState } from "$lib/dummy-data";
  import { state } from "$lib/model";
</script>

<div class="flex flex-col gap-3 pl-6 pt-4">
  <Button
    on:click={() => {
      populateState(state);
    }}>Generate Dummy Data</Button
  >
  <Button
    on:click={() => {
      state.clear();
    }}>Reset State</Button
  >
</div>
