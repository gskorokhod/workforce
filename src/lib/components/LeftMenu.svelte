<script lang="ts">
  import Sidebar from "$lib/components/Sidebar/Sidebar.svelte";
  import { SidebarPosition } from "$lib/components/Sidebar/types.ts";
  import type { Link } from "$lib/types.ts";

  let links: Link[];

  export { links };
</script>

<Sidebar position={SidebarPosition.left}>
  <div slot="expanded_top">
    <h1>Workforce Planning</h1>
  </div>

  <ul slot="expanded_main">
    {#each links as link}
      <li>
        <a href={link.href}>
          <i class="{link.icon}" />
          {link.text}
        </a>
      </li>
    {/each}
  </ul>

  <ul slot="collapsed_main">
    {#each links as link}
      <li>
        <a href={link.href}>
          <i class="{link.icon}" />
        </a>
      </li>
    {/each}
  </ul>

  <a slot="collapsed_bottom" href="#" class="settings">
    <i class="fa-solid fa-cog" />
  </a>

  <a slot="expanded_bottom" href="#" class="settings">
    <i class="fa-solid fa-cog" />
    Settings
  </a>
</Sidebar>

<style>
  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }

  h1 {
    font-family: "Atkinson Hyperlegible", sans-serif;
    font-size: 16px;
    font-weight: bold;
    margin: 0;
    padding: 2px 0 0;
  }

  li {
    margin: 0;
    padding: 8px 0;
  }

  a {
    text-decoration: none;
    color: black;
    display: flex;
    align-items: center;
    font-family: "Atkinson Hyperlegible", sans-serif;
    font-size: 16px;
    font-weight: normal;
  }

  a:hover {
    color: blue;
  }

  i {
    margin-right: 10px;
  }

  .settings {
    width: 100%;
  }
</style>