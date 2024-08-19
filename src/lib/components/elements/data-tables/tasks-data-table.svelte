<script lang="ts">
  import type { ColumnInitializer } from "$lib/components/elements/data-tables/core";
  import type { Person, Skill, Task } from "$lib/types";
  import type { AnyPlugins } from "svelte-headless-table/plugins";

  import ConstraintsList from "$lib/components/elements/constraint/constraints-for-list.svelte";
  import DataTable from "$lib/components/elements/data-tables/core/data-table.svelte";
  import RowActions from "$lib/components/elements/data-tables/lib/row-actions.svelte";
  import PeopleList from "$lib/components/elements/person/people-list.svelte";
  import SkillsList from "$lib/components/elements/skill/skills-list.svelte";
  import TaskBadge from "$lib/components/elements/task/task-badge.svelte";
  import { getConstraintsFor, tasks } from "$lib/stores.ts";
  import { getAssignedPeopleForTask, getRequiredSkillsForTask } from "$lib/types/task.ts";
  import { capitalize } from "$lib/utils/utils.ts";
  import { type Writable, writable } from "svelte/store";
  import {
    createRender,
    DataBodyCell,
    FlatColumn,
    type ReadOrWritable
  } from "svelte-headless-table";
  import { createSortKeysStore, type WritableSortKeys } from "svelte-headless-table/plugins";

  let data: ReadOrWritable<Task[]> = tasks;
  let actions: Map<string, (item: Task) => void> = new Map();
  let filterValue: Writable<string> = writable("");
  let sortKeys: WritableSortKeys = createSortKeysStore([]);
  let hideForId: { [key: string]: boolean } = {};
  let flatColumns: FlatColumn<Task, AnyPlugins, string>[];
  let className: string = "";

  let columnInitializers: ColumnInitializer[] = [
    {
      accessor: (row: Task) => row,
      cell: (cell: DataBodyCell<unknown>) => createRender(TaskBadge, { task: cell.value as Task }),
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
      accessor: (row: Task) => getAssignedPeopleForTask(row),
      cell: (cell: DataBodyCell<unknown>) =>
        createRender(PeopleList, {
          compact: true,
          people: cell.value as Person[]
        }),
      header: "Assigned people",
      id: "people",
      plugins: {
        sort: {
          getSortValue: (value: Person[]) => value.map((p) => p.name).join(" ")
        },
        tableFilter: {
          getFilterValue: (value: Person[]) => value.map((p) => p.name).join(" ")
        }
      }
    },
    {
      accessor: (row: Task) => getRequiredSkillsForTask(row),
      cell: (cell: DataBodyCell<unknown>) =>
        createRender(SkillsList, {
          compact: true,
          skills: cell.value as Skill[]
        }),
      header: "Required skills",
      id: "required_skills",
      plugins: {
        sort: {
          getSortValue: (value: Skill[]) => value.map((skill) => skill.name).join(" ")
        },
        tableFilter: {
          getFilterValue: (value: Skill[]) => value.map((skill) => skill.name).join(" ")
        }
      }
    },
    {
      accessor: (row: Task) => row,
      cell: (cell: DataBodyCell<unknown>) =>
        createRender(ConstraintsList, { forOperand: cell.value as Task }),
      header: "Constraints",
      id: "constraints",
      plugins: {
        sort: {
          getSortValue: (value: Task) =>
            getConstraintsFor(value)
              .map((constraint) => constraint.type)
              .join(" ")
        },
        tableFilter: {
          getFilterValue: (value: Task) =>
            getConstraintsFor(value)
              .map((constraint) => constraint.type)
              .join(" ")
        }
      }
    }
  ];

  if (actions.size > 0) {
    columnInitializers.push({
      accessor: (row: Task) => row,
      cell: (cell: DataBodyCell<unknown>) =>
        createRender(RowActions, { actions, item: cell.value as Task }),
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
