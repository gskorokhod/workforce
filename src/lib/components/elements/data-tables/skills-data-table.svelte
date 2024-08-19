<script lang="ts">
  import type { ColumnInitializer } from "$lib/components/elements/data-tables/core";
  import type { Person, Skill, Task } from "$lib/types";
  import type { AnyPlugins } from "svelte-headless-table/plugins";

  import DataTable from "$lib/components/elements/data-tables/core/data-table.svelte";
  import RowActions from "$lib/components/elements/data-tables/lib/row-actions.svelte";
  import PeopleList from "$lib/components/elements/person/people-list.svelte";
  import SkillBadge from "$lib/components/elements/skill/skill-badge.svelte";
  import TasksList from "$lib/components/elements/task/tasks-list.svelte";
  import { skills } from "$lib/stores.ts";
  import { getPeopleWithSkill, getTasksWithSkill } from "$lib/types/skill.ts";
  import { capitalize } from "$lib/utils/utils.ts";
  import { type Writable, writable } from "svelte/store";
  import {
    createRender,
    DataBodyCell,
    FlatColumn,
    type ReadOrWritable
  } from "svelte-headless-table";
  import { createSortKeysStore, type WritableSortKeys } from "svelte-headless-table/plugins";

  let data: ReadOrWritable<Skill[]> = skills;
  let actions: Map<string, (item: Skill) => void> = new Map();
  let filterValue: Writable<string> = writable("");
  let sortKeys: WritableSortKeys = createSortKeysStore([]);
  let hideForId: { [key: string]: boolean } = {};
  let flatColumns: FlatColumn<Skill, AnyPlugins, string>[];
  let className: string = "";

  let columnInitializers: ColumnInitializer[] = [
    {
      accessor: (row: Skill) => row,
      cell: (cell: DataBodyCell<unknown>) =>
        createRender(SkillBadge, { skill: cell.value as Skill }),
      header: "Icon",
      id: "icon",
      plugins: {
        sort: {
          disable: true
        },
        tableFilter: {
          disable: true
        }
      }
    },
    {
      accessor: "name",
      cell: (cell: DataBodyCell<unknown>) => capitalize(cell.value as string),
      header: "Name",
      id: "name"
    },
    {
      accessor: "description",
      header: "Description",
      id: "description"
    },
    {
      accessor: (row: Skill) => getTasksWithSkill(row),
      cell: (cell: DataBodyCell<unknown>) =>
        createRender(TasksList, { tasks: cell.value as Task[] }),
      header: "Required for tasks",
      id: "tasks",
      plugins: {
        sort: {
          getSortValue: (value: Task[]) => value.map((task) => task.name).join(" ")
        },
        tableFilter: {
          getFilterValue: (value: Task[]) => value.map((task) => task.name).join(" ")
        }
      }
    },
    {
      accessor: (row: Skill) => getPeopleWithSkill(row),
      cell: (cell: DataBodyCell<unknown>) =>
        createRender(PeopleList, {
          compact: true,
          people: cell.value as Person[]
        }),
      header: "People with this skill",
      id: "people",
      plugins: {
        sort: {
          getSortValue: (value: Person[]) => value.map((person) => person.name).join(" ")
        },
        tableFilter: {
          getFilterValue: (value: Person[]) => value.map((person) => person.name).join(" ")
        }
      }
    }
  ];

  if (actions.size > 0) {
    columnInitializers.push({
      accessor: (row: Skill) => row,
      cell: (cell: DataBodyCell<unknown>) =>
        createRender(RowActions, { actions, item: cell.value as Skill }),
      header: "Actions",
      id: "actions",
      plugins: {
        sort: {
          disable: true
        },
        tableFilter: {
          disable: true
        }
      }
    });
  }

  export { actions, className as class, data, filterValue, flatColumns, hideForId, sortKeys };
</script>

<DataTable
  bind:filterValue
  bind:flatColumns
  bind:hideForId
  bind:sortKeys
  class={className}
  {columnInitializers}
  {data}
/>
