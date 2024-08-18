<script lang="ts">
  import type { Skill } from "$lib/types";

  import SkillBadge from "$lib/components/elements/skill/skill-badge.svelte";

  let skills: Skill[] = [];
  let placeholder: string = "No skills";
  let compact: boolean = true;
  let className: string = "";

  export { className as class,compact, skills };
</script>

{#if skills.length > 0}
  <div class="flex flex-row flex-wrap items-center justify-start gap-2 {className}">
    {#each skills as skill}
      <SkillBadge {compact} {skill} />
    {/each}
  </div>
{:else}
  <div class="text-accent-foreground {className}">{placeholder}</div>
{/if}
