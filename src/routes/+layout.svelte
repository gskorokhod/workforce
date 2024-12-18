<script lang="ts">
  import { NavMenu } from "$lib/components/nav-menu";
  import "../app.css";
</script>

<div class="flex h-dvh w-dvw flex-row bg-gray-100">
  <NavMenu />
  <div class="flex h-dvh w-full flex-col overflow-y-scroll rounded p-4">
    <slot />
  </div>
</div>

<footer class="text-center">
  <h1 class="text-xl">My footer</h1>
</footer>
