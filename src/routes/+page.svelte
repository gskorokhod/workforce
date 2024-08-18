<script lang="ts">
  // noinspection ES6UnusedImports
  import * as Resizable from "$lib/components/ui/resizable";
  import TopBar from "$lib/components/elements/top-bar/top_bar.svelte";
  import Combobox from "$lib/components/ui/combobox/combobox.svelte";
  import Search from "$lib/components/ui/search/search.svelte";
  import Sidebar from "$lib/components/ui/sidebar/sidebar.svelte";
  import AssignmentCard from "$lib/components/elements/assignment/assignment-card.svelte";
  import { Button } from "$lib/components/ui/button";
  import { FilterIcon } from "lucide-svelte";
  import type { ComboboxItem } from "$lib/components/ui/combobox";
  import { SidebarPosition } from "$lib/components/ui/sidebar/index.ts";
  import type { Assignment } from "$lib/types";
  import { assignments } from "$lib/stores.ts";
  import MiniSearch from "minisearch";
  import { getLocationForAssignment, getPeopleForAssignment, getTasksForAssignment } from "$lib/types/assignment.ts";

  let schedules: ComboboxItem[] = [
    { label: "Schedule 1", value: "schedule1" },
    { label: "Schedule 2", value: "schedule2" }
  ];

  let miniSearch = new MiniSearch({
    idField: "uuid",
    extractField: (assignment: Assignment, fieldName: string) => {
      switch (fieldName) {
        case "uuid":
          return assignment.uuid;
        case "name":
          return assignment.name;
        case "description":
          return assignment.description;
        case "location":
          return getLocationForAssignment(assignment)?.name ?? "No Location";
        case "tasks":
          return getTasksForAssignment(assignment).map((task) => task.name).join(" ");
        case "people":
          return getPeopleForAssignment(assignment).map((person) => person.name).join(" ");
        case "start_time":
          return assignment.start_date_time.toString();
        case "end_time":
          return assignment.end_date_time.toString();
        default:
          return "";
      }
    },
    fields: ["name", "description", "location", "tasks", "people", "start_time", "end_time"],
    storeFields: ["name"]
  });

  let search: string = "";
  $: search_ids = miniSearch.search(search, {
    prefix: true,
    fuzzy: 0.2
  }).map((res) => res.id);
  $: filtered_assignments = search === "" ? $assignments : $assignments.filter((assignment) => search_ids.includes(assignment.uuid));

  assignments.subscribe(value => {
    miniSearch.removeAll();
    miniSearch.addAllAsync(value);
  });
</script>

<div class="bg-gray-50 w-full">
  <main class="w-full h-dvh flex flex-col items-start justify-start overflow-y-scroll">
    <TopBar sticky={true}>
      <svelte:fragment slot="start">
        <Combobox options={schedules} placeholder="Select schedule..." icon={{icon: "mdi:calendar"}} />
      </svelte:fragment>

      <svelte:fragment slot="end">
        <Button size="icon_xl" variant="ghost" on:click={() => {}}>
          <FilterIcon />
        </Button>
        <Search onInput={(s) => search = s} />
      </svelte:fragment>
    </TopBar>

    <!-- The !important styles are needed to override the default styling of the component and make it grow with the number of assignment cards -->
    <Resizable.PaneGroup direction="horizontal" style="overflow: unset !important; height: fit-content !important;">
      <Resizable.Pane class="flex flex-col gap-4 p-4 h-fit">
        {#each filtered_assignments as assignment}
          {#if assignment !== undefined}
            <AssignmentCard {assignment} />
          {/if}
        {/each}
      </Resizable.Pane>

      <Resizable.Handle />

      <Resizable.Pane class="flex flex-col gap-4 p-4 h-fit">
      </Resizable.Pane>

      <Resizable.Handle />

      <Resizable.Pane class="flex flex-col gap-4 p-4 h-fit">
      </Resizable.Pane>
    </Resizable.PaneGroup>
  </main>
</div>

<Sidebar position={SidebarPosition.right}>

</Sidebar>
