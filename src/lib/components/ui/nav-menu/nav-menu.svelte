<script lang="ts">
  import { base } from "$app/paths";
  import { Sidebar, SidebarPosition } from "../sidebar";
  import { misc } from "$lib/model/utils";
  import { page } from "$app/stores";
  import {
    BriefcaseBusinessIcon,
    CalendarRangeIcon,
    ClipboardListIcon,
    HomeIcon,
    LayoutDashboardIcon,
    MapPinIcon,
    SettingsIcon,
    UsersRoundIcon
  } from "lucide-svelte";
  import { Button } from "../button";

  let expandedWidth: string = "250px";
  let collapsedWidth: string = "72px";
  let position: SidebarPosition = SidebarPosition.left;
  let isExpanded: boolean = false;

  function isActive(href: string): boolean {
    const pageURL = misc.lstrip($page.url.pathname, base);
    const linkURL = misc.lstrip(href, base);

    if (href === "/") {
      return pageURL === linkURL;
    }
    return pageURL.startsWith(linkURL);
  }
</script>

<Sidebar {collapsedWidth} {expandedWidth} {isExpanded} {position}>
  <h1 class="w-[200px] py-1 pl-3 text-3xl font-bold" slot="expanded_top">Workforce Planning</h1>

  <ul class="m-0 w-full list-none p-0" slot="expanded_main">
    <Button
      class="w-full justify-start"
      href="{base}/"
      size="xl"
      variant={isActive("/") ? "default" : "ghost"}
    >
      <HomeIcon />
      Home
    </Button>
    <Button
      class="w-full justify-start"
      href="{base}/shifts/"
      size="xl"
      variant={isActive("/shifts/") ? "default" : "ghost"}
    >
      <CalendarRangeIcon />
      Shifts
    </Button>
    <Button
      class="w-full justify-start"
      href="{base}/people/"
      size="xl"
      variant={isActive("/people/") ? "default" : "ghost"}
    >
      <UsersRoundIcon />
      People
    </Button>
    <Button
      class="w-full justify-start"
      href="{base}/tasks/"
      size="xl"
      variant={isActive("/tasks/") ? "default" : "ghost"}
    >
      <ClipboardListIcon />
      Tasks
    </Button>
    <Button
      class="w-full justify-start"
      href="{base}/locations/"
      size="xl"
      variant={isActive("/locations/") ? "default" : "ghost"}
    >
      <MapPinIcon />
      Locations
    </Button>
    <Button
      class="w-full justify-start"
      href="{base}/skills/"
      size="xl"
      variant={isActive("/skills/") ? "default" : "ghost"}
    >
      <BriefcaseBusinessIcon />
      Skills
    </Button>
    <Button
      class="w-full justify-start"
      href="{base}/dashboard/"
      size="xl"
      variant={isActive("/dashboard/") ? "default" : "ghost"}
    >
      <LayoutDashboardIcon />
      Dashboard
    </Button>
  </ul>

  <ul class="m-0 w-full list-none p-0" slot="collapsed_main">
    <Button href="{base}/" size="icon-xl" variant={isActive("/") ? "default" : "ghost"}>
      <HomeIcon />
    </Button>
    <Button
      href="{base}/shifts/"
      size="icon-xl"
      variant={isActive("/shifts/") ? "default" : "ghost"}
    >
      <CalendarRangeIcon />
    </Button>
    <Button
      href="{base}/people/"
      size="icon-xl"
      variant={isActive("/people/") ? "default" : "ghost"}
    >
      <UsersRoundIcon />
    </Button>
    <Button href="{base}/tasks/" size="icon-xl" variant={isActive("/tasks/") ? "default" : "ghost"}>
      <ClipboardListIcon />
    </Button>
    <Button
      href="{base}/locations/"
      size="icon-xl"
      variant={isActive("/locations/") ? "default" : "ghost"}
    >
      <MapPinIcon />
    </Button>
    <Button
      href="{base}/skills/"
      size="icon-xl"
      variant={isActive("/skills/") ? "default" : "ghost"}
    >
      <BriefcaseBusinessIcon />
    </Button>
    <Button
      href="{base}/dashboard/"
      size="icon-xl"
      variant={isActive("/dashboard/") ? "default" : "ghost"}
    >
      <LayoutDashboardIcon />
    </Button>
  </ul>

  <div class="flex w-full" slot="collapsed_bottom">
    <Button
      class="w-full justify-start"
      href="{base}/settings/"
      size="icon-xl"
      variant={isActive("/settings/") ? "default" : "ghost"}
    >
      <SettingsIcon />
    </Button>
  </div>

  <div class="flex w-full" slot="expanded_bottom">
    <Button
      class="w-full justify-start"
      href="{base}/settings/"
      size="xl"
      variant={isActive("/settings/") ? "default" : "ghost"}
    >
      <SettingsIcon />
      Settings
    </Button>
  </div>
</Sidebar>
