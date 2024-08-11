<script lang="ts">
  import TopBar from "$lib/components/elements/top-bar/top_bar.svelte";
  import Search from "$lib/components/ui/search/search.svelte";
  import SkillsDataTable from "$lib/components/elements/data-tables/skills-data-table.svelte";
  import SkillEditDialog from "$lib/components/elements/skill/skill-edit-dialog.svelte";
  import ColumnHideSelector from "$lib/components/elements/data-tables/lib/column-hide-selector.svelte";
  import { FlatColumn, type ReadOrWritable } from "svelte-headless-table";
  import type { Skill } from "$lib/types";
  import { deleteSkill, skills } from "$lib/stores.ts";
  import { writable, type Writable } from "svelte/store";
  import { createSortKeysStore, type WritableSortKeys } from "svelte-headless-table/plugins";
  import type { AnyPlugins } from "svelte-headless-table/plugins";
  import { createSkill, defaultSkillProps, type SkillProps } from "$lib/types/skill.ts";
  import { Button } from "$lib/components/ui/button";
  import { PlusIcon } from "lucide-svelte";

  let data: ReadOrWritable<Skill[]> = skills;
  let filterValue: Writable<string> = writable("");
  let sortKeys: WritableSortKeys = createSortKeysStore([]);
  let flatColumns: FlatColumn<Skill, AnyPlugins, string>[];
  let hideForId: { [key: string]: boolean } = {};
  let className: string = "";

  let open: boolean = false;
  let skillUUID: string | undefined = undefined;
  let skillProps: Writable<SkillProps> = writable(defaultSkillProps());

  function handleEdit(s: Skill) {
    skillUUID = s.uuid;
    skillProps.set(s as SkillProps);
    open = true;
  }

  function handleDelete(s: Skill) {
    deleteSkill(s);
  }

  function onSubmit(props: SkillProps) {
    console.log("onSubmit");

    skills.update((skillList) => {
      if (skillUUID !== undefined) {
        const index = skillList.findIndex((p) => p.uuid === skillUUID);
        if (index !== -1) {
          console.log("Updating index: ", index);
          const p = skillList[index];
          skillList[index] = {
            ...p,
            ...props
          };
          console.log(skillList[index]);
          return skillList;
        }
      }

      let newSkill = createSkill(props);
      skillList.push(newSkill);
      return skillList;
    });

    skillProps.set(defaultSkillProps());
    skillUUID = undefined;
    open = false;
  }

  function handleAdd() {
    skillProps.set(defaultSkillProps());
    skillUUID = undefined;
    open = true;
  }

  const actions: Map<string, (s: Skill) => void> = new Map([
    ["Edit", handleEdit],
    ["Delete", handleDelete]
  ]);

  export { data, className as class };
</script>

<SkillEditDialog bind:skillProps bind:open {onSubmit} />
<div class="h-full w-full flex flex-col items-start justify-start overflow-y-scroll {className}">
  <TopBar sticky={true}>
    <svelte:fragment slot="start">
      <Button size="icon_xl" variant="ghost" on:click={handleAdd}
              class="text-muted-foreground hover:text-accent-foreground">
        <PlusIcon />
      </Button>
      <slot name="start" />
    </svelte:fragment>

    <svelte:fragment slot="middle">
      <slot name="middle" />
    </svelte:fragment>

    <svelte:fragment slot="end">
      <ColumnHideSelector {flatColumns} bind:hideForId />
      <Search onInput={(s) => filterValue.set(s)} />
    </svelte:fragment>
  </TopBar>
  <SkillsDataTable {data} {actions} bind:filterValue bind:sortKeys bind:hideForId bind:flatColumns class="w-full" />
</div>