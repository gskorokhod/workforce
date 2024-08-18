<script lang="ts">
  import type { Skill } from "$lib/types";
  import type { AnyPlugins } from "svelte-headless-table/plugins";

  import ColumnHideSelector from "$lib/components/elements/data-tables/lib/column-hide-selector.svelte";
  import SkillsDataTable from "$lib/components/elements/data-tables/skills-data-table.svelte";
  import SkillEditDialog from "$lib/components/elements/skill/skill-edit-dialog.svelte"; import TopBar from "$lib/components/elements/top-bar/top_bar.svelte";
  import { Button } from "$lib/components/ui/button";
  import Search from "$lib/components/ui/search/search.svelte";
  import { deleteSkill, skills } from "$lib/stores.ts";
  import { createSkill, defaultSkillProps, type SkillProps } from "$lib/types/skill.ts";
  import { PlusIcon } from "lucide-svelte";
  import { type Writable,writable } from "svelte/store";
  import { FlatColumn } from "svelte-headless-table";
  import { createSortKeysStore, type WritableSortKeys } from "svelte-headless-table/plugins";

  let data: Writable<Skill[]> = skills;
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
    ["Delete", handleDelete],
    ["Edit", handleEdit]
  ]);

  export { className as class,data };
</script>

<div class="flex h-full w-full flex-col items-start justify-start overflow-y-scroll {className}">
  <TopBar sticky={true}>
    <svelte:fragment slot="start">
      <Button
        class="text-muted-foreground hover:text-accent-foreground"
        on:click={handleAdd}
        size="icon_xl"
        variant="ghost"
      >
        <PlusIcon />
      </Button>
      <slot name="start" />
    </svelte:fragment>

    <svelte:fragment slot="middle">
      <slot name="middle" />
    </svelte:fragment>

    <svelte:fragment slot="end">
      <ColumnHideSelector bind:hideForId {flatColumns} />
      <Search onInput={(s) => filterValue.set(s)} />
    </svelte:fragment>
  </TopBar>
  <SkillsDataTable
    {actions}
    bind:filterValue
    bind:flatColumns
    bind:hideForId
    bind:sortKeys
    class="w-full"
    {data}
  />
</div>
<SkillEditDialog bind:open bind:skillProps {onSubmit} />
