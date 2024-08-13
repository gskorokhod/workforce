<!--suppress ES6UnusedImports -->
<script lang="ts">
  import {
    Button
  } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import Search from "$lib/components/ui/search/search.svelte";
  import type { Writable } from "svelte/store";
  import type { LocationProps } from "$lib/types/location.ts";

  let open: boolean = false;
  let locationProps: Writable<LocationProps>;
  let onSubmit: (p: LocationProps) => void = () => {
  };

  function handleSubmit() {
    onSubmit($locationProps);
    open = false;
  };

  export { open, locationProps, onSubmit };
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger>
    <slot />
  </Dialog.Trigger>
  <Dialog.Content class="p-4">
    <Dialog.Header>
      <Dialog.Title class="font-semibold text-xl">Edit Location Data</Dialog.Title>
      <Dialog.Description>
        Make changes to the location record here. Click save when you're done.
      </Dialog.Description>
    </Dialog.Header>
    <Search onInput={}/>
    <!--    <div class="flex flex-col w-full h-full gap-6 mt-4 mb-4 p-1 overflow-y-scroll max-h-[400px]">-->
    <!--      <div class="flex flex-row justify-between items-center gap-8 w-full">-->
    <!--        {#if $personProps === undefined}-->
    <!--          <UserCircleIcon class="h-28 w-28 text-muted-foreground" />-->
    <!--        {:else}-->
    <!--          <Avatar.Root class="h-28 w-28">-->
    <!--            <Avatar.Image src={$personProps.image_url} alt={$personProps.name} />-->
    <!--            <Avatar.Fallback>{getInitials($personProps.name)}</Avatar.Fallback>-->
    <!--          </Avatar.Root>-->
    <!--        {/if}-->
    <!--        <div class="flex flex-col h-full w-full gap-2">-->
    <!--          <div>-->
    <!--            <Label for="employee_name" class="font-semibold mb-0.5">Name</Label>-->
    <!--            <Input type="text" id="employee_name" placeholder="Name" bind:value={$personProps.name} />-->
    <!--          </div>-->
    <!--          <div>-->
    <!--            <Label for="employee_job_title" class="font-semibold mb-0.5">Job Title</Label>-->
    <!--            <Input type="text" id="employee_job_title" placeholder="Job Title" bind:value={$personProps.job_title} />-->
    <!--          </div>-->
    <!--        </div>-->
    <!--      </div>-->
    <!--      <div>-->
    <!--        <span class="block font-semibold text-sm mb-1.5">Date of birth:</span>-->
    <!--        <DatePicker value={toCalendarDate($personProps.birthday)} onChange={(dv) => personProps.update((p) => {-->
    <!--          if (dv === undefined) return p;-->
    <!--          return {-->
    <!--            ...p,-->
    <!--            birthday: dv.toDate(getLocalTimeZone())-->
    <!--          }-->
    <!--        })} class="w-full" />-->
    <!--      </div>-->
    <!--      <div>-->
    <!--        <span class="block font-semibold text-sm">Skills:</span>-->
    <!--        <SkillsSelectorList bind:skill_uuids={$personProps.skill_uuids} compact={false} class="mt-2 w-full" />-->
    <!--      </div>-->
    <!--    </div>-->
    <Dialog.Footer>
      <Button type="submit" on:click={handleSubmit}>Save changes</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>