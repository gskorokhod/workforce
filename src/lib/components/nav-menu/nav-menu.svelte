<script lang="ts">
  import { base } from "$app/paths";
  import { page } from "$app/stores";
  import { state } from "$lib/model";
  import { misc } from "$lib/utils";
  import {
    BriefcaseBusinessIcon,
    CalendarRangeIcon,
    ClipboardListIcon,
    CodeXmlIcon,
    HomeIcon,
    MapPinIcon,
    SettingsIcon,
    UsersRoundIcon,
  } from "lucide-svelte";
  import { Button } from "../button";
  import { Sidebar, SidebarPosition } from "../sidebar";

  const settings = state.settings;

  let position: SidebarPosition = SidebarPosition.left;
  let isExpanded = false;

  $: isActive = (href: string) => {
    const pageURL = misc.lstrip($page.url.pathname, base);
    const linkURL = misc.lstrip(href, base);
    if (href === "/") {
      return pageURL === linkURL;
    }
    return pageURL.startsWith(linkURL);
  };
</script>

<Sidebar bind:isExpanded {position}>
  <svelte:fragment slot="top">
    <h1
      class="overflow-hidden py-1 pl-3 text-3xl font-bold transition-all duration-300 {isExpanded
        ? 'w-[200px]'
        : 'w-0'}"
    >
      Workforce Planning
    </h1>
  </svelte:fragment>

  <svelte:fragment slot="main">
    <li class="w-full">
      <Button
        class="transition-all duration-300 {isExpanded ? 'w-full justify-start' : ''}"
        href="{base}/"
        size={isExpanded ? "xl" : "icon-xl"}
        variant={isActive("/") ? "default" : "ghost"}
      >
        <HomeIcon class="min-w-8"/>
        {#if isExpanded}
          Home
        {/if}
      </Button>
    </li>
    <li class="w-full">
      <Button
        class="transition-all duration-300 {isExpanded ? 'w-full justify-start' : ''}"
        href="{base}/shifts/"
        size={isExpanded ? "xl" : "icon-xl"}
        variant={isActive("/shifts/") ? "default" : "ghost"}
      >
        <CalendarRangeIcon class="min-w-8"/>
        {#if isExpanded}
          Shifts
        {/if}
      </Button>
    </li>
    <li class="w-full">
      <Button
        class="transition-all duration-300 {isExpanded ? 'w-full justify-start' : ''}"
        href="{base}/people/"
        size={isExpanded ? "xl" : "icon-xl"}
        variant={isActive("/people/") ? "default" : "ghost"}
      >
        <UsersRoundIcon class="min-w-8" />
        {#if isExpanded}
          People
        {/if}
      </Button>
    </li>
    <li class="w-full">
      <Button
        class="transition-all duration-300 {isExpanded ? 'w-full justify-start' : ''}"
        href="{base}/locations/"
        size={isExpanded ? "xl" : "icon-xl"}
        variant={isActive("/locations/") ? "default" : "ghost"}
      >
        <MapPinIcon class="min-w-8" />
        {#if isExpanded}
          Locations
        {/if}
      </Button>
    </li>
    <li class="w-full">
      <Button
        class="transition-all duration-300 {isExpanded ? 'w-full justify-start' : ''}"
        href="{base}/skills/"
        size={isExpanded ? "xl" : "icon-xl"}
        variant={isActive("/skills/") ? "default" : "ghost"}
      >
        <BriefcaseBusinessIcon class="min-w-8"/>
        {#if isExpanded}
          Skills
        {/if}
      </Button>
    </li>
    {#if $settings.assignmentMode === "granular"}
      <li class="w-full">
        <Button
          class="transition-all duration-300 {isExpanded ? 'w-full justify-start' : ''}"
          href="{base}/tasks/"
          size={isExpanded ? "xl" : "icon-xl"}
          variant={isActive("/tasks/") ? "default" : "ghost"}
        >
          <ClipboardListIcon class="min-w-8"/>
          {#if isExpanded}
            Tasks
          {/if}
        </Button>
      </li>
    {/if}
    {#if $settings.development}
      <li class="w-full">
        <Button
          class="transition-all duration-300 {isExpanded ? 'w-full justify-start' : ''}"
          href="{base}/ui_playground/"
          size={isExpanded ? "xl" : "icon-xl"}
          variant={isActive("/ui_playground/") ? "default" : "ghost"}
        >
          <CodeXmlIcon class="min-w-8"/>
          {#if isExpanded}
            UI Components
          {/if}
        </Button>
      </li>
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="bottom">
    <Button
      href="{base}/settings/"
      size={isExpanded ? "xl" : "icon-xl"}
      variant={isActive("/settings/") ? "default" : "ghost"}
      class="transition-all duration-300 {isExpanded ? 'w-full justify-start' : ''}"
    >
      <SettingsIcon class="min-w-8" />
      {#if isExpanded}
        Settings
      {/if}
    </Button>
  </svelte:fragment>
</Sidebar>
