<script lang="ts">
  import * as Table from "$lib/components/ui/table";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { Search } from "$lib/components/search";
  import Combobox from "$lib/components/combobox/combobox.svelte";
  import { Button } from "$lib/components/ui/button";
  import { range } from "$lib/utils/misc";
  import { CalendarDate, today, getLocalTimeZone } from "@internationalized/date";
  import type { ReadOrWritable } from "svelte-headless-table";
  import { get as _get } from "svelte/store";
  import { Person, State, Shift, state as GLOBAL_STATE } from "$lib/model";
  import { Profile } from "../profile";
  import {
    AssignmentPattern,
    dayOff,
    resolveAssignments,
    type AssignmentEntry,
    type ResolvedAssignment,
  } from "$lib/model/core/assignment";
  import {
    ChevronLeftIcon,
    ChevronRightIcon,
    PlusIcon,
    RepeatIcon,
    TrashIcon,
  } from "lucide-svelte";
  import { Icon, type Display } from "$lib/ui";
  import { uuidOf } from "$lib/model/core/misc";
  import { Recurrence } from "$lib/model/temporal";
  import { fmtDateRange, getWeekStart } from "$lib/model/temporal/utils";
  import EditDialog from "../edit-dialog/edit-dialog.svelte";
  import DeleteDialog from "../data-table/lib/delete-dialog.svelte";

  export let state: State = GLOBAL_STATE;
  export let people: ReadOrWritable<Person[]> = state.people;
  export let shifts: ReadOrWritable<Shift[]> = state.shifts;
  export let start: CalendarDate = getWeekStart(today(getLocalTimeZone()));
  export let days = 7;
  export let options: Intl.DateTimeFormatOptions = {};
  export let locale: string | string[] = Array.from(navigator.languages) || "en";
  let className = "";

  let currSearch = "";
  let currStart = start;
  let selectedPattern: AssignmentPattern | undefined;
  let deleteDialogOpen = false;
  let editDialogOpen = false;
  let editDialogTitle = "";

  const oneOffAssignments = state.assignments;
  const assignmentPatterns = state.assignmentPatterns;
  const _assignmentPatterns = state._assignmentPatterns;

  function mkOnSelect(person: Person, date: CalendarDate): (a?: AssignmentEntry) => void {
    return (a) => {
      oneOffAssignments.update((curr) => {
        curr.put(person, date, a);
        return curr;
      });
    };
  }

  function mkDisplay(a?: AssignmentEntry): Display | undefined {
    if (!a) return undefined;
    if (a.shift) {
      return (
        _get(state._shifts).get(uuidOf(a.shift)) ?? {
          name: "Unknown Shift",
        }
      );
    }
    return {
      name: "Day Off",
      icon: Icon.fromString("lucide:calendar-off", "#9a3412"),
    };
  }

  function mkId(a: AssignmentEntry): string {
    if (a.shift) return uuidOf(a.shift);
    return a.type;
  }

  function mkOptions(date: CalendarDate, shifts: Shift[]): AssignmentEntry[] {
    const ans: AssignmentEntry[] = [dayOff()];
    for (const shift of shifts) {
      if (shift.occursOn(date)) {
        ans.push({ type: "SHIFT", shift });
      }
    }
    return ans;
  }

  function editPattern(res: ResolvedAssignment) {
    if (!res) return;
    if (res.source instanceof AssignmentPattern) {
      selectedPattern = res.source;
      editDialogTitle = "Edit Assignment Pattern";
      editDialogOpen = true;
    }
  }

  function newPattern() {
    selectedPattern = new AssignmentPattern(
      {
        pattern: Recurrence.daily({ startDate: currStart, endDate: end }),
        person: _get(people)[0],
        params: {
          type: "SHIFT",
          shift: _get(shifts)[0],
        },
      },
      state,
    );
    editDialogTitle = "New Assignment Pattern";
    editDialogOpen = true;
  }

  function nextWeek() {
    currStart = getWeekStart(currStart).add({ weeks: 1 });
  }

  function prevWeek() {
    currStart = getWeekStart(currStart).add({ weeks: -1 });
  }

  function resetWeek() {
    currStart = start;
  }

  $: formatter = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    ...options,
  });
  $: end = currStart.add({ days });
  $: cols = range(days).map((d) => currStart.add({ days: d }));
  $: assignments = resolveAssignments($oneOffAssignments, $assignmentPatterns, currStart, end);
  $: filteredPeople = $people.filter((person) =>
    person.name.toLowerCase().includes(currSearch.toLowerCase()),
  );

  export { className as class };
</script>

<div class={className}>
  <div class="flex h-20 w-full flex-row items-center justify-between bg-secondary p-4">
    <div>
      <Button
        size="lg"
        variant="ghost"
        class="p-4 text-base text-muted-foreground"
        on:click={newPattern}
      >
        <PlusIcon />
        Add Pattern
      </Button>
    </div>
    <div class="flex w-[30%] flex-row items-center">
      <Tooltip.Root openDelay={500} closeDelay={100} group="assignments">
        <Tooltip.Trigger>
          <Button class="text-muted-foreground" size="icon" variant="ghost" on:click={prevWeek}
            ><ChevronLeftIcon /></Button
          >
        </Tooltip.Trigger>
        <Tooltip.Content class="" side="top">Previous Week</Tooltip.Content>
      </Tooltip.Root>

      <Tooltip.Root openDelay={500} closeDelay={100} group="assignments">
        <Tooltip.Trigger>
          <Button class="text-muted-foreground" size="icon" variant="ghost" on:click={nextWeek}
            ><ChevronRightIcon /></Button
          >
        </Tooltip.Trigger>
        <Tooltip.Content class="" side="top">Next Week</Tooltip.Content>
      </Tooltip.Root>

      <Tooltip.Root openDelay={500} closeDelay={100} group="assignments">
        <Tooltip.Trigger>
          <Button variant="ghost" class="ml-2 text-xl font-medium" on:click={resetWeek}
            >{fmtDateRange(currStart, end)}</Button
          >
        </Tooltip.Trigger>
        <Tooltip.Content class="" side="top">Click to go to the current week</Tooltip.Content>
      </Tooltip.Root>
    </div>
    <div>
      <Search bind:value={currSearch} />
    </div>
  </div>
  <Table.Root class="w-full">
    <Table.Header class="font-semibold text-muted-foreground">
      <Table.Row>
        <Table.Cell>Employee</Table.Cell>
        {#each cols as date}
          <Table.Cell>{formatter.format(date.toDate(getLocalTimeZone()))}</Table.Cell>
        {/each}
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {#each filteredPeople as person}
        <Table.Row>
          <Table.Cell>
            <Profile
              item={person}
              group="assignments"
              variant="full"
              hoverEffects={false}
              class="font-medium"
            />
          </Table.Cell>
          {#each cols as date}
            <Table.Cell>
              {@const res = assignments.get(person)?.get(date)}
              {#if res && res.source instanceof AssignmentPattern}
                <Button
                  class="group h-12 w-full justify-around p-2 text-sm font-normal"
                  variant="ghost"
                  on:click={() => editPattern(res)}
                >
                  <Profile
                    item={mkDisplay(res)}
                    variant="full"
                    class="h-12 w-full max-w-24 text-sm font-normal"
                    hoverEffects={false}
                    showTooltip={false}
                  />
                  <RepeatIcon
                    size={20}
                    class="text-muted-foreground transition-all group-hover:text-primary"
                  />
                </Button>
              {:else}
                <Combobox
                  value={res}
                  onSelect={mkOnSelect(person, date)}
                  options={mkOptions(date, $shifts)}
                  display={mkDisplay}
                  getId={mkId}
                  class="h-12 w-full p-1 text-sm font-normal"
                  placeholder="Not Assigned"
                />
              {/if}
            </Table.Cell>
          {/each}
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
<EditDialog
  {state}
  selected={selectedPattern}
  bind:open={editDialogOpen}
  title={editDialogTitle}
  onSubmit={() => {
    //assignments = resolveAssignments($oneOffAssignments, $assignmentPatterns, currStart, end);
  }}
>
  <Button
    class="mx-2"
    variant="destructive"
    slot="actions"
    on:click={() => {
      deleteDialogOpen = true;
    }}
  >
    <TrashIcon /> Delete Pattern</Button
  >
</EditDialog>
<DeleteDialog
  {state}
  selected={selectedPattern}
  bind:open={deleteDialogOpen}
  onDelete={() => {
    editDialogOpen = false;
    selectedPattern = undefined;
  }}
/>
