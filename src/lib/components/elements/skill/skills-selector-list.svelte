<script lang="ts">
  import SkillSelector from "$lib/components/elements/skill/skill-selector.svelte";
  import { skills as skillsStore } from "$lib/stores";
  import type { Skill } from "$lib/types";
  import { pad } from "$lib/utils/utils.ts";
  import { ChipVariant } from "$lib/components/ui/chip";

  let options: Skill[] = $skillsStore;
  let skill_uuids: (string | undefined)[] = [];
  let n_skills: number | undefined = undefined;
  let compact: boolean = true;
  let className: string = "";

  $: {
    if (n_skills !== undefined) {
      skill_uuids = pad(skill_uuids, n_skills, undefined);
      skill_uuids = skill_uuids.sort((a, b) => a === undefined ? 1 : b === undefined ? -1 : 0); // put all undefined elements at the end
    } else {
      skill_uuids = skill_uuids.filter((s) => s !== undefined);
    }
  }

  function chooseVariant(s: string | undefined, i: number) {
    if (n_skills !== undefined && i < n_skills) {
      if (s === undefined) {
        return ChipVariant.destructive;
      }
    }

    return ChipVariant.default;
  }

  function hasSkill(skills: (string | undefined)[], skill: Skill | undefined) {
    if (skill === undefined) return false;
    return skills.map((s) => s).includes(skill.uuid);
  }

  export { skill_uuids, n_skills, compact, className as class };
</script>


<div class="flex flex-row items-center justify-start gap-2 flex-wrap {className}">
  {#each skill_uuids as skill, i}
    <SkillSelector bind:skill_uuid={skill}
                   options={options}
                   variant={chooseVariant(skill, i)}
                   compact={compact}
                   filter={(s) => (!hasSkill(skill_uuids, s) || (s === undefined) || (s.uuid === skill))} />
  {/each}
  {#if n_skills === undefined}
    <SkillSelector skill_uuid={undefined}
                   options={options}
                   onChange={(_, s) => {
                     skill_uuids = [...skill_uuids, s];
                     return undefined;
                   }}
                   compact={compact}
                   filter={(s) => s !== undefined && !hasSkill(skill_uuids, s)} />
  {/if}
</div>