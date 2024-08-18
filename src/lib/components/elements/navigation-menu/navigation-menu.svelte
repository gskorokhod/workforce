<script lang="ts">
  import type { Link } from "$lib/types/ui.ts";

  import { base } from "$app/paths";
  import { page } from "$app/stores";
  import { Button } from "$lib/components/ui/button";
  import Icon from "$lib/components/ui/icon/icon.svelte";
  import { SidebarPosition } from "$lib/components/ui/sidebar";
  import Sidebar from "$lib/components/ui/sidebar/sidebar.svelte";
  import { SettingsIcon } from "lucide-svelte";

  let links: Link[];
  let position: SidebarPosition = SidebarPosition.left;
  let collapsedWidth: string = "72px";
  let expandedWidth: string = "250px";
  let isExpanded: boolean = true;

  $: isActive = (href: string) => {
    if (href === `${base}/`) {
      return $page.url.pathname === href;
    }
    return $page.url.pathname.includes(href);
  };

  export { isExpanded,links, position };
</script>

<Sidebar {collapsedWidth} {expandedWidth} {isExpanded} {position}>
  <h1 class="w-[200px] py-1 pl-3 text-3xl font-bold" slot="expanded_top">Workforce Planning</h1>

  <ul class="m-0 w-full list-none p-0" slot="expanded_main">
    {#each links as link}
      <li class="m-0 h-12 py-1">
        <Button
          class="w-full justify-start"
          href={link.href}
          size="xl"
          variant={isActive(link.href) ? "default" : "ghost"}
        >
          {#if link.icon !== undefined}
            <Icon icon={link.icon} />
          {/if}
          {link.text}
        </Button>
      </li>
    {/each}
  </ul>

  <ul class="m-0 w-full list-none p-0" slot="collapsed_main">
    {#each links as link}
      <li class="m-0 h-12 py-1">
        <Button href={link.href} size="icon_xl" variant={isActive(link.href) ? "default" : "ghost"}>
          {#if link.icon !== undefined}
            <Icon icon={link.icon} />
          {:else}
            ?
          {/if}
        </Button>
      </li>
    {/each}
  </ul>

  <div class="flex w-full" slot="collapsed_bottom">
    <Button
      href="{base}/settings/"
      size="icon_xl"
      variant={isActive(`${base}/settings/`) ? "default" : "ghost"}
    >
      <SettingsIcon />
    </Button>
  </div>

  <div class="flex w-full" slot="expanded_bottom">
    <Button
      class="w-full justify-start"
      href="{base}/settings/"
      size="xl"
      variant={isActive(`${base}/settings/`) ? "default" : "ghost"}
    >
      <SettingsIcon />
      Settings
    </Button>
  </div>
</Sidebar>
