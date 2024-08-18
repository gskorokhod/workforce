<script lang="ts">
  import type { ComboboxItem } from "$lib/components/ui/combobox";
  import type { Assignment } from "$lib/types";

  import AssignmentCard from "$lib/components/elements/assignment/assignment-card.svelte";
  import TopBar from "$lib/components/elements/top-bar/top_bar.svelte";
  import { Button } from "$lib/components/ui/button";
  import Combobox from "$lib/components/ui/combobox/combobox.svelte";
  import * as Resizable from "$lib/components/ui/resizable";
  import Search from "$lib/components/ui/search/search.svelte";
  import { SidebarPosition } from "$lib/components/ui/sidebar/index.ts";
  import Sidebar from "$lib/components/ui/sidebar/sidebar.svelte";
  import { assignments } from "$lib/stores.ts";
  import {
    getLocationForAssignment,
    getPeopleForAssignment,
    getTasksForAssignment
  } from "$lib/types/assignment.ts";
  // noinspection ES6UnusedImports
  import { FilterIcon } from "lucide-svelte";
  import MiniSearch from "minisearch";

  let schedules: ComboboxItem[] = [
    { label: "Schedule 1", value: "schedule1" },
    { label: "Schedule 2", value: "schedule2" }
  ];

  let miniSearch = new MiniSearch({
    extractField: (assignment: Assignment, fieldName: string) => {
      switch (fieldName) {
        case "description":
          return assignment.description;
        case "end_time":
          return assignment.end_date_time.toString();
        case "location":
          return getLocationForAssignment(assignment)?.name ?? "No Location";
        case "name":
          return assignment.name;
        case "people":
          return getPeopleForAssignment(assignment)
            .map((person) => person.name)
            .join(" ");
        case "start_time":
          return assignment.start_date_time.toString();
        case "tasks":
          return getTasksForAssignment(assignment)
            .map((task) => task.name)
            .join(" ");
        case "uuid":
          return assignment.uuid;
        default:
          return "";
      }
    },
    fields: ["name", "description", "location", "tasks", "people", "start_time", "end_time"],
    idField: "uuid",
    storeFields: ["name"]
  });

  let search: string = "";
  $: search_ids = miniSearch
    .search(search, {
      fuzzy: 0.2,
      prefix: true
    })
    .map((res) => res.id);
  $: filtered_assignments =
    search === ""
      ? $assignments
      : $assignments.filter((assignment) => search_ids.includes(assignment.uuid));

  assignments.subscribe((value) => {
    miniSearch.removeAll();
    miniSearch.addAllAsync(value);
  });
</script>

<div class="w-full bg-gray-50">
  <main class="flex h-dvh w-full flex-col items-start justify-start overflow-y-scroll">
    <TopBar sticky={true}>
      <svelte:fragment slot="start">
        <Combobox
          icon={{ icon: "mdi:calendar" }}
          options={schedules}
          placeholder="Select schedule..."
        />
      </svelte:fragment>

      <svelte:fragment slot="end">
        <Button on:click={() => {}} size="icon_xl" variant="ghost">
          <FilterIcon />
        </Button>
        <Search onInput={(s) => (search = s)} />
      </svelte:fragment>
    </TopBar>

    <!-- The !important styles are needed to override the default styling of the component and make it grow with the number of assignment cards -->
    <Resizable.PaneGroup
      direction="horizontal"
      style="overflow: unset !important; height: fit-content !important;"
    >
      <Resizable.Pane class="flex h-fit flex-col gap-4 p-4">
        {#each filtered_assignments as assignment}
          {#if assignment !== undefined}
            <AssignmentCard {assignment} />
          {/if}
        {/each}
      </Resizable.Pane>

      <Resizable.Handle />

      <Resizable.Pane class="flex h-fit flex-col gap-4 p-4"></Resizable.Pane>

      <Resizable.Handle />

      <Resizable.Pane class="flex h-fit flex-col gap-4 p-4"></Resizable.Pane>
    </Resizable.PaneGroup>
  </main>
</div>

<Sidebar position={SidebarPosition.right}></Sidebar>
