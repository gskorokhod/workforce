<script lang="ts">
  import { NavMenu } from "$lib/components/nav-menu";
  import { ModeWatcher } from "mode-watcher";
  import "../app.css";
</script>

<ModeWatcher />

<NavMenu />

<div class="flex h-dvh w-dvw flex-col overflow-y-scroll bg-background pl-16">
  <div class="flex flex-col p-4">
    <slot />
  </div>
</div>
