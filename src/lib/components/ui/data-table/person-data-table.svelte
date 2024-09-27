<script lang="ts">
  import type { Person, Skill } from "$lib/model";
  import type { Display } from "$lib/model/ui";
  import { createRender, FlatColumn, type ReadOrWritable } from "svelte-headless-table";
  import {
    type AnyPlugins,
    createSortKeysStore,
    type WritableSortKeys
  } from "svelte-headless-table/plugins";
  import { type Writable, writable } from "svelte/store";
  import { ProfilesList } from "../profile-picture";
  import ProfilePicture from "../profile-picture/profile-picture.svelte";
  import { type ColumnInitializer, DataTableCore } from "./core";

  let data: ReadOrWritable<Person[]>;
  let actions: Map<string, (item: Person) => void> = new Map();
  let filterValue: Writable<string> = writable("");
  let sortKeys: WritableSortKeys = createSortKeysStore([]);
  let hideForId: { [key: string]: boolean } = {};
  let flatColumns: FlatColumn<Person, AnyPlugins, string>[];
  let className: string = "";

  let columnInitializers: ColumnInitializer<Person>[] = [
    {
      accessor: (row) => row as Display,
      cell: (cell) => createRender(ProfilePicture, { item: cell.value }),
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
      accessor: (row: Person) => row.name,
      header: "Name",
      id: "name"
    },
    {
      accessor: (row: Person) => row.age,
      header: "Age",
      id: "age"
    },
    {
      accessor: (row: Person) => row.job,
      header: "Job Title",
      id: "job"
    },
    {
      accessor: (row: Person) => row.skills,
      cell: (cell) => createRender(ProfilesList, { items: cell.value, placeholder: "No Skills" }),
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
    }
  ];

  export { data, actions, className as class};
</script>

<DataTableCore
  bind:filterValue
  bind:flatColumns
  bind:hideForId
  bind:sortKeys
  class={className}
  {columnInitializers}
  {data}
  {actions}
/>
