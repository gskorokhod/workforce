<script lang="ts">
  import type { Person, Skill, Task } from "$lib/types";
  import { getConstraintsFor, tasks } from "$lib/stores.ts";
  import {
    createRender,
    DataBodyCell,
    FlatColumn,
    type ReadOrWritable
  } from "svelte-headless-table";
  import TaskBadge from "$lib/components/elements/task/task-badge.svelte";
  import SkillsList from "$lib/components/elements/skill/skills-list.svelte";
  import DataTable from "$lib/components/elements/data-tables/core/data-table.svelte";
  import { writable, type Writable } from "svelte/store";
  import { createSortKeysStore, type WritableSortKeys } from "svelte-headless-table/plugins";
  import { capitalize } from "$lib/utils.ts";
  import ConstraintsList from "$lib/components/elements/constraint/constraints-for-list.svelte";
  import PeopleList from "$lib/components/elements/person/people-list.svelte";
  import type { AnyPlugins } from "svelte-headless-table/plugins";
  import type { ColumnInitializer } from "$lib/components/elements/data-tables/core";
  import RowActions from "$lib/components/elements/data-tables/lib/row-actions.svelte";
  import { getAssignedPeopleForTask, getRequiredSkillsForTask } from "$lib/types/task.ts";

  let data: ReadOrWritable<Task[]> = tasks;
  let actions: Map<string, (item: Task) => void> = new Map();
  let filterValue: Writable<string> = writable("");
  let sortKeys: WritableSortKeys = createSortKeysStore([]);
  let hideForId: { [key: string]: boolean } = {};
  let flatColumns: FlatColumn<Task, AnyPlugins, string>[];
  let className: string = "";

  let columnInitializers: ColumnInitializer[] = [
    {
      id: "icon",
      accessor: (row: Task) => row,
      header: "Icon",
      cell: (cell: DataBodyCell<unknown>) => createRender(TaskBadge, { task: cell.value as Task }),
      plugins: {
        tableFilter: {
          disable: true
        },
        sort: {
          disable: true
        }
      }
    },
    {
      id: "name",
      accessor: "name",
      header: "Name",
      cell: (cell: DataBodyCell<unknown>) => capitalize(cell.value as string)
    },
    {
      id: "description",
      accessor: "description",
      header: "Description"
    },
    {
      id: "people",
      accessor: (row: Task) => getAssignedPeopleForTask(row),
      header: "Assigned people",
      cell: (cell: DataBodyCell<unknown>) => createRender(PeopleList, {
        people: cell.value as Person[],
        compact: true
      }),
      plugins: {
        tableFilter: {
          getFilterValue: (value: Person[]) => value.map((p) => p.name).join(" ")
        },
        sort: {
          getSortValue: (value: Person[]) => value.map((p) => p.name).join(" ")
        }
      }
    },
    {
      id: "required_skills",
      accessor: (row: Task) => getRequiredSkillsForTask(row),
      header: "Required skills",
      cell: (cell: DataBodyCell<unknown>) => createRender(SkillsList, {
        skills: cell.value as Skill[],
        compact: true
      }),
      plugins: {
        tableFilter: {
          getFilterValue: (value: Skill[]) => value.map((skill) => skill.name).join(" ")
        },
        sort: {
          getSortValue: (value: Skill[]) => value.map((skill) => skill.name).join(" ")
        }
      }
    },
    {
      id: "constraints",
      accessor: (row: Task) => row,
      header: "Constraints",
      cell: (cell: DataBodyCell<unknown>) => createRender(ConstraintsList, { forOperand: cell.value as Task }),
      plugins: {
        tableFilter: {
          getFilterValue: (value: Task) => getConstraintsFor(value).map((constraint) => constraint.type).join(" ")
        },
        sort: {
          getSortValue: (value: Task) => getConstraintsFor(value).map((constraint) => constraint.type).join(" ")
        }
      }
    }
  ];

  if (actions.size > 0) {
    columnInitializers.push({
      id: "actions",
      accessor: (row: Task) => row,
      header: "Actions",
      cell: (cell: DataBodyCell<unknown>) => createRender(RowActions, { item: cell.value as Task, actions }),
      plugins: {
        tableFilter: {
          disable: true
        },
        sort: {
          disable: true
        }
      }
    });
  }

  export { data, filterValue, sortKeys, hideForId, flatColumns, className as class };
</script>

<DataTable {data} {columnInitializers} bind:filterValue bind:sortKeys bind:hideForId bind:flatColumns
           class={className} />
