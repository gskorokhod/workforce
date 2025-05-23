<script lang="ts">
  import Assignments from "$lib/components/views/assignments.svelte";
  import { state } from "$lib/model";
</script>

<main class="h-full w-full">
  <Assignments {state} class="h-full w-full rounded-md border shadow-md" />
</main>
