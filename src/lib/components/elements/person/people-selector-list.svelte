<script lang="ts">
  import PersonSelector from "$lib/components/elements/person/person-selector.svelte";
  import type { Person } from "$lib/types";
  import { pad } from "$lib/utils.ts";
  import { employees } from "$lib/stores.ts";
  import { ChipVariant } from "$lib/components/ui/chip";

  let options: Person[] = $employees;
  let people_uuids: (string | undefined)[] = [];
  let compact: boolean = false;
  let min_people: number;
  let max_people: number;
  let className: string = "";

  $: {
    people_uuids = pad(people_uuids, max_people, undefined);
    people_uuids = people_uuids.sort((a, b) => a === undefined ? 1 : b === undefined ? -1 : 0); // put all undefined elements at the end
  }

  function chooseVariant(p: string | undefined, i: number) {
    if (i < min_people) {
      if (p === undefined) {
        return ChipVariant.destructive;
      }
    }

    return ChipVariant.default;
  }

  function hasPerson(people: (string | undefined)[], person: Person | undefined) {
    if (person === undefined) return false;
    return people.includes(person.uuid);
  }

  export { people_uuids, compact, min_people, max_people, className as class };
</script>

{#if compact}
  <div class="group flex flex-row items-center justify-start flex-wrap {className}">
    {#each people_uuids as person_uuid, i}
      <div class="relative transition-all w-4 h-10 hover:z-20 hover:w-5 group-hover:opacity-55 hover:!opacity-100">
        <PersonSelector bind:person_uuid
                        options={options}
                        variant={chooseVariant(person_uuid, i)}
                        filter={(p) => (!hasPerson(people_uuids, p) || (p === undefined) || (p.uuid === person_uuid))}
                        class="absolute top-0 left-0 w-10 h-10" />
      </div>
    {/each}
  </div>
{:else}
  <div class="flex flex-row items-center justify-start gap-2 flex-wrap {className}">
    {#each people_uuids as person_uuid, i}
      <PersonSelector bind:person_uuid
                      options={options}
                      variant={chooseVariant(person_uuid, i)}
                      filter={(p) => (!hasPerson(people_uuids, p) || (p === undefined) || (p.uuid === person_uuid))} />
    {/each}
  </div>
{/if}