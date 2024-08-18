<script lang="ts">
  import type { Person } from "$lib/types";

  import PersonAvatar from "$lib/components/elements/person/person-avatar.svelte";

  let people: Person[] = [];
  let compact: boolean = false;
  let max: number | undefined = undefined;
  let className: string = "";

  $: people_list = max ? people.slice(0, max) : people;

  export { className as class,compact, max, people };
</script>

{#if compact}
  <div class="group flex flex-row flex-wrap items-center justify-start {className}">
    {#each people_list as person}
      <div
        class="relative h-10 w-4 transition-all hover:z-20 hover:w-5 hover:!opacity-100 group-hover:opacity-55"
      >
        <PersonAvatar class="absolute left-0 top-0 h-10 w-10" {person} />
      </div>
    {/each}
    {#if max && people.length > max}
      <div
        class="group relative h-10 w-4 transition-all hover:z-20 hover:w-5 hover:!opacity-100 group-hover:opacity-55"
      >
        <div
          class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground"
        >
          +{people.length - max}
        </div>
      </div>
    {/if}
  </div>
{:else}
  <div class="flex flex-row flex-wrap items-center justify-start gap-2 {className}">
    {#each people_list as person}
      <PersonAvatar {person} />
    {/each}
    {#if max && people.length > max}
      <div
        class="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground"
      >
        +{people.length - max}
      </div>
    {/if}
  </div>
{/if}
