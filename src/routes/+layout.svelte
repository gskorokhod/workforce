<script lang="ts">
  import "@fortawesome/fontawesome-free/css/all.min.css";

  import Sidebar from "$lib/components/Sidebar/Sidebar.svelte";
  import LeftMenu from "$lib/components/LeftMenu.svelte";

  import { SidebarPosition } from "$lib/components/Sidebar/types.ts";
  import type { Link } from "$lib/types.ts";

  let links: Link[] = [
    { href: "#", icon: "fa-regular fa-calendar", text: "Shifts" },
    { href: "#", icon: "fa-solid fa-user", text: "Employees" },
    { href: "#", icon: "fa-solid fa-list-check", text: "Tasks" },
    { href: "#", icon: "fa-solid fa-briefcase", text: "Skills" },
    { href: "#", icon: "fa-solid fa-chart-line", text: "Dashboard" }
  ];
</script>

<div class="content">
  <LeftMenu links={links} />

  <main>
    <slot />
  </main>

  <Sidebar position={SidebarPosition.right} />
</div>

<footer>
  <h1>My footer</h1>
</footer>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .content {
    display: flex;
    flex-direction: row;
    height: 100vh;
  }

  main {
    background: #FFFFFF;
    width: 100%;
    height: 100%;
  }
</style>