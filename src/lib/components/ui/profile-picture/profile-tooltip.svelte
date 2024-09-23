<script lang="ts" generics="T extends Display">
  import { ProfilePicture } from ".";

  import { Person, Shift, Skill, Task } from "$lib/model/core";
  import { type Display } from "$lib/model/ui";
  import { CakeIcon } from "lucide-svelte";

  let item: T | undefined = undefined;
  let placeholder: string = "No item selected";
  let className: string = "";

  export { className as class, item, placeholder };
</script>

{#if item}
  {#if item instanceof Person || item instanceof Task || item instanceof Skill || item instanceof Location || item instanceof Shift}
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
          {item.job}
        {:else if item instanceof Task}
          Task
        {:else if item instanceof Skill}
          Skill
        {:else if item instanceof Location}
          Location
        {:else if item instanceof Shift}
          Shift
        {/if}
      </div>
    </div>
    {#if item.description}
      <p>{item.description}</p>
    {/if}
  {/if}
{:else}
  <p class="text-muted-foreground">{placeholder}</p>
{/if}
