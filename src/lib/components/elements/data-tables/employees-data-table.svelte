<script lang="ts">
  import type { ColumnInitializer } from "$lib/components/elements/data-tables/core";
  import type { Person, Skill } from "$lib/types";

  import ConstraintsList from "$lib/components/elements/constraint/constraints-for-list.svelte";
  import DataTable from "$lib/components/elements/data-tables/core/data-table.svelte";
  import RowActions from "$lib/components/elements/data-tables/lib/row-actions.svelte";
  import PersonAvatar from "$lib/components/elements/person/person-avatar.svelte";
  import SkillsList from "$lib/components/elements/skill/skills-list.svelte";
  import { employees, getConstraintsFor } from "$lib/stores.ts";
  import { getAgeForPerson, getSkillsForPerson } from "$lib/types/person.ts";
  import { type Writable, writable } from "svelte/store";
  import {
    createRender,
    DataBodyCell,
    FlatColumn,
    type ReadOrWritable
  } from "svelte-headless-table";
  import {
    type AnyPlugins,
    createSortKeysStore,
    type WritableSortKeys
  } from "svelte-headless-table/plugins";

  let data: ReadOrWritable<Person[]> = employees;
  let actions: Map<string, (item: Person) => void> = new Map();
  let filterValue: Writable<string> = writable("");
  let sortKeys: WritableSortKeys = createSortKeysStore([]);
  let hideForId: { [key: string]: boolean } = {};
  let flatColumns: FlatColumn<Person, AnyPlugins, string>[];
  let className: string = "";

  let columnInitializers: ColumnInitializer[] = [
    {
      accessor: (row: Person) => row,
      cell: (cell: DataBodyCell<unknown>) =>
        createRender(PersonAvatar, { person: cell.value as Person }),
      header: "Avatar",
      id: "avatar",
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
      header: "Name",
      id: "name"
    },
    {
      accessor: (row: Person) => getAgeForPerson(row),
      header: "Age",
      id: "age"
    },
    {
      accessor: "job_title",
      header: "Job Title",
      id: "job_title"
    },
    {
      accessor: (row: Person) => getSkillsForPerson(row),
      cell: (cell: DataBodyCell<unknown>) =>
        createRender(SkillsList, { skills: cell.value as Skill[] }),
      header: "Skills",
      id: "skills",
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
      accessor: (row: Person) => row,
      cell: (cell: DataBodyCell<unknown>) =>
        createRender(ConstraintsList, {
          forOperand: cell.value as Person
        }),
      header: "Constraints",
      id: "constraints",
      plugins: {
        sort: {
          getSortValue: (value: Person) =>
            getConstraintsFor(value)
              .map((constraint) => constraint.type)
              .join(" ")
        },
        tableFilter: {
          getFilterValue: (value: Person) =>
            getConstraintsFor(value)
              .map((constraint) => constraint.type)
              .join(" ")
        }
      }
    }
  ];

  if (actions.size > 0) {
    columnInitializers.push({
      accessor: (row: Person) => row,
      cell: (cell: DataBodyCell<unknown>) =>
        createRender(RowActions, { actions, item: cell.value as Person }),
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
