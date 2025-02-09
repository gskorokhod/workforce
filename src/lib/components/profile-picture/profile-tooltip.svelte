<script lang="ts" generics="T extends Display">
  import { ProfilePicture } from ".";

  import { Person, Qualification, Shift, Task } from "$lib/model/core";
  import { type Display } from "$lib/ui";
  import { CakeIcon } from "lucide-svelte";

  let item: T | undefined = undefined;
  let placeholder = "No item selected";
  let className = "";

  export { className as class, item, placeholder };
</script>

{#if item}
  {#if item instanceof Person || item instanceof Task || item instanceof Qualification || item instanceof Location || item instanceof Shift}
    <div class="flex w-max flex-row items-center justify-between gap-4 {className}">
      <ProfilePicture {item} size="lg" />
      <div class="flex w-full flex-col justify-between gap-[2px] py-1">
        <div class="flex w-full flex-row items-center justify-between">
          <span class="font-semibold">{item.name}</span>
          {#if item instanceof Person}
            <span class="flex flex-row items-center">
              <CakeIcon class="h-4" />
              {item.age}
            </span>
          {/if}
        </div>
        {#if item instanceof Person}
          {item.role}
        {:else if item instanceof Task}
          Task
        {:else if item instanceof Qualification}
          Skill
        {:else if item instanceof Location}
          Location
        {:else if item instanceof Shift}
          Shift
        {/if}
      </div>
    </div>
    {#if item.description}
      <p class="max-w-[30ch] text-gray-500">{item.description}</p>
    {/if}
  {/if}
{:else}
  <p class="text-muted-foreground">{placeholder}</p>
{/if}
