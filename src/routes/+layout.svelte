<script lang="ts">
  import { NavMenu } from "$lib/components/ui/nav-menu";
  import "../app.css";
</script>

<div class="flex h-screen w-screen flex-row">
  <NavMenu />
  <slot />
</div>

<footer class="text-center">
  <h1 class="text-xl">My footer</h1>
</footer>
