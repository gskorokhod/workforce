<script lang="ts">
  import { NavMenu } from "$lib/components/nav-menu";
  import "../app.css";
</script>

<NavMenu />

<div class="flex h-dvh w-dvw flex-col bg-gray-100 overflow-y-scroll pl-20">
  <div class="flex flex-col p-2">
    <slot />
  </div>
</div>
