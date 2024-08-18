<script lang="ts">
  import type { Link } from "$lib/types/ui.ts";

  import { base } from "$app/paths";
  import NavigationMenu from "$lib/components/elements/navigation-menu/navigation-menu.svelte";

  import "../app.css";

  let links: Link[] = [
    { href: `${base}/`, icon: { icon: "mdi:calendar" }, text: "Shifts" },
    { href: `${base}/employees/`, icon: { icon: "mdi:account" }, text: "Employees" },
    { href: `${base}/tasks/`, icon: { icon: "mdi:clipboard-list" }, text: "Tasks" },
    { href: `${base}/locations/`, icon: { icon: "mdi:map-marker" }, text: "Locations" },
    { href: `${base}/skills/`, icon: { icon: "mdi:briefcase" }, text: "Skills" },
    { href: `${base}/dashboard/`, icon: { icon: "mdi:view-dashboard" }, text: "Dashboard" }
  ];
</script>

<div class="flex h-screen w-screen flex-row">
  <NavigationMenu {links} />
  <slot />
</div>

<footer class="text-center">
  <h1 class="text-xl">My footer</h1>
</footer>
