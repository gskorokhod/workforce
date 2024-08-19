<script lang="ts">
  import type { Person } from "$lib/types";

  import PersonSelector from "$lib/components/elements/person/person-selector.svelte";
  import { ChipVariant } from "$lib/components/ui/chip";
  import { employees } from "$lib/stores.ts";
  import { pad } from "$lib/utils/utils.ts";

  let options: Person[] = $employees;
  let people_uuids: (string | undefined)[] = [];
  let compact: boolean = false;
  let min_people: number;
  let max_people: number;
  let className: string = "";

  $: {
    people_uuids = pad(people_uuids, max_people, undefined);
    people_uuids = people_uuids.sort((a, b) => (a === undefined ? 1 : b === undefined ? -1 : 0)); // put all undefined elements at the end
  }

  function chooseVariant(p: string | undefined, i: number) {
    if (i < min_people && p === undefined) {
      return ChipVariant.destructive;
    }

    return ChipVariant.default;
  }

  function hasPerson(people: (string | undefined)[], person: Person | undefined) {
    if (person === undefined) return false;
    return people.includes(person.uuid);
  }

  export { className as class, compact, max_people, min_people, options, people_uuids };
</script>

{#if compact}
  <div class="group flex flex-row flex-wrap items-center justify-start {className}">
    {#each people_uuids as person_uuid, i}
      <div
        class="relative h-10 w-4 transition-all hover:z-20 hover:w-5 hover:!opacity-100 group-hover:opacity-55"
      >
        <PersonSelector
          bind:person_uuid
          class="absolute left-0 top-0 h-10 w-10"
          filter={(p) => !hasPerson(people_uuids, p) || p === undefined || p.uuid === person_uuid}
          {options}
          variant={chooseVariant(person_uuid, i)}
        />
      </div>
    {/each}
  </div>
{:else}
  <div class="flex flex-row flex-wrap items-center justify-start gap-2 {className}">
    {#each people_uuids as person_uuid, i}
      <PersonSelector
        bind:person_uuid
        filter={(p) => !hasPerson(people_uuids, p) || p === undefined || p.uuid === person_uuid}
        {options}
        variant={chooseVariant(person_uuid, i)}
      />
    {/each}
  </div>
{/if}
