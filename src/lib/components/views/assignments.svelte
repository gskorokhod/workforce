<script lang="ts">
  import * as Table from "$lib/components/ui/table";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { Search } from "$lib/components/search";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import { Label } from "$lib/components/ui/label";
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
    LockIcon,
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
  import { Separator } from "../ui/separator";
  import CornerHighlight from "../corner-highlight/corner-highlight.svelte";

  export let state: State = GLOBAL_STATE;
  export let people: ReadOrWritable<Person[]> = state.people;
  export let shifts: ReadOrWritable<Shift[]> = state.shifts;
  export let locale: string = navigator.language || "en";
  export let start: CalendarDate = getWeekStart(today(getLocalTimeZone()), locale);
  export let days = 7;
  export let options: Intl.DateTimeFormatOptions = {};
  let className = "";

  let currSearch = "";
  let currStart = start;
  let selectedPattern: AssignmentPattern | undefined;
  let creatingNew = false;
  let deleteDialogOpen = false;
  let editDialogOpen = false;
  let editDialogTitle = "";

  const settings = state.settings;
  const oneOffAssignments = state.assignments;
  const assignmentPatterns = state.assignmentPatterns;
  const comboboxesOpen: Record<string, boolean> = {};

  function mkOnSelect(person: Person, date: CalendarDate): (a?: AssignmentEntry) => void {
    return (a) => {
      oneOffAssignments.update((curr) => {
        if (!a) {
          curr.delete(person, date);
        } else {
          curr.put(person, date, a);
        }
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
        ans.push({ type: "SHIFT", shift, preference: "preferred" });
      }
    }
    return ans;
  }

  function editPattern(res: ResolvedAssignment) {
    if (!res) return;
    if (res.source instanceof AssignmentPattern) {
      selectedPattern = res.source;
      editDialogTitle = "Edit Assignment Pattern";
      creatingNew = false;
      editDialogOpen = true;
    }
  }

  function newPattern() {
    selectedPattern = new AssignmentPattern(
      {
        pattern: Recurrence.daily({ startDate: currStart, endDate: end }),
        person: _get(people)[0],
        params: {
          preference: "preferred",
          type: "SHIFT",
          shift: _get(shifts)[0],
        },
      },
      state,
    );
    creatingNew = true;
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
  $: horizonStart = $settings.planningHorizonStart;
  $: horizonEnd = $settings.planningHorizonEnd;

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
        <Table.Cell class="border">Employee</Table.Cell>
        {#each cols as date}
          <Table.Cell class="border">{formatter.format(date.toDate(getLocalTimeZone()))}</Table.Cell
          >
        {/each}
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {#each filteredPeople as person}
        <Table.Row>
          <Table.Cell class="border p-0">
            <!-- <CornerHighlight class="p-0" contentClass="p-1"> -->
            <Profile
              item={person}
              group="assignments"
              variant="full"
              hoverEffects={false}
              class="font-medium"
            />
            <!-- </CornerHighlight> -->
          </Table.Cell>
          {#each cols as date}
            {#key assignments}
              <Table.Cell class="border p-0">
                {@const res = assignments.get(person)?.get(date)}
                {@const shift = res?.shift}
                {@const pref = res?.preference}
                {@const type = res?.type}
                {#if res && res.source instanceof AssignmentPattern}
                  <CornerHighlight
                    class="p-0"
                    contentClass="p-1.5"
                    cornerOpacity={pref === "required" ? 1 : 0}
                    cornerSize="48px"
                  >
                    <LockIcon slot="corner" class="pb-0.5 pl-1 pr-0.5 pt-1 text-background" />
                    <Button
                      class="group h-12 w-full justify-between px-2 text-sm font-normal"
                      variant="ghost"
                      on:click={() => editPattern(res)}
                    >
                      <Profile
                        item={mkDisplay(res)}
                        variant="full"
                        class="h-12 w-full text-sm font-normal"
                        hoverEffects={false}
                        showTooltip={false}
                      />
                      <RepeatIcon
                        size={20}
                        class="text-muted-foreground transition-all group-hover:text-primary"
                      />
                    </Button>
                  </CornerHighlight>
                {:else}
                  {@const id = `${person.uuid}-${date.toString()}`}
                  <CornerHighlight
                    class="p-0"
                    contentClass="p-1.5"
                    cornerOpacity={pref === "required" ? 1 : 0}
                    cornerSize={"48px"}
                  >
                    <LockIcon slot="corner" class="pb-0.5 pl-1 pr-0.5 pt-1 text-background" />
                    <Combobox
                      bind:open={comboboxesOpen[id]}
                      value={res}
                      closeOnSelect={false}
                      onSelect={mkOnSelect(person, date)}
                      options={mkOptions(date, $shifts)}
                      display={mkDisplay}
                      getId={mkId}
                      class="h-12 w-full border-0 text-sm font-normal"
                      placeholder="No Preference"
                    >
                      <div slot="footer" class="w-full">
                        <Separator class="mb-3 mt-0.5" />
                        <div class="flex w-full flex-col gap-2 px-3.5 pb-2">
                          <div class="flex w-full items-center space-x-2">
                            <Checkbox
                              {id}
                              checked={pref === "required"}
                              onCheckedChange={(checked) => {
                                oneOffAssignments.update((assignments) => {
                                  const assignment = assignments.get(person, date);
                                  if (assignment) {
                                    assignment.preference = checked ? "required" : "preferred";
                                    assignments.put(person, date, assignment);
                                  }
                                  return assignments;
                                });
                              }}
                            />
                            <Label
                              for={id}
                              class="font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              "Hard" assignment
                            </Label>
                          </div>
                          {#if pref}
                            <p class="text-sm font-normal text-muted-foreground">
                              {person.name}
                              {#if pref === "required"}
                                {#if type === "DAY_OFF"}
                                  cannot work
                                {:else if shift}
                                  must be assigned to {shift.name}
                                  {shift.name.toLowerCase().endsWith("shift") ? "" : "Shift"}
                                {/if}
                              {:else if pref === "preferred"}
                                {#if type === "DAY_OFF"}
                                  would prefer to take a day off
                                {:else if shift}
                                  would prefer to work {shift.name}
                                  {shift.name.toLowerCase().endsWith("shift") ? "" : "Shift"}
                                {/if}
                              {/if}
                              on this day
                            </p>
                          {/if}
                        </div>
                      </div>
                    </Combobox>
                  </CornerHighlight>
                {/if}
              </Table.Cell>
            {/key}
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
    class="mx-2 {creatingNew && 'hidden'}"
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
