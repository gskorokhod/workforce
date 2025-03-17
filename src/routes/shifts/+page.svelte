<script lang="ts">
  import ShiftsDataTable from "$lib/components/data-table/shift-data-table.svelte";
  import { state } from "$lib/model";

  const shifts = state.shifts;
</script>

<div class="w-full">
  <!-- <Shifts class="rounded-md bg-card shadow-md" /> -->
  <ShiftsDataTable {state} data={shifts} class="rounded-md bg-card shadow-md" />
</div>
