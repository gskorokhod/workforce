<!-- <script lang="ts">
  import { state as GLOBAL_STATE } from "$lib/model";
  import * as Tabs from "$lib/components/ui/tabs";
  import { ProfilePicture } from "$lib/components/profile-picture";
  import PersonDataTable from "$lib/components/data-table/person-data-table.svelte";

  const teams = GLOBAL_STATE.teams;
</script>

{#if $teams.length > 0}
  <Tabs.Root value="account" class="h-full w-full" orientation="vertical">
    <Tabs.List>
      {#each $teams as team}
        <Tabs.Trigger value={team.uuid}>
          <ProfilePicture item={team} class="!pointer-events-none" />
          <span>{team.name}</span>
        </Tabs.Trigger>
      {/each}
    </Tabs.List>
    {#each $teams as team}
      <Tabs.Content value={team.uuid}>
        <PersonDataTable data={team.getPeople()}></PersonDataTable>
      </Tabs.Content>
    {/each}
  </Tabs.Root>
{:else}
  <p>No teams found</p>
{/if} -->
