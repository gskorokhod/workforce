<script lang="ts">
  import type { ColumnInitializer } from "$lib/components/elements/data-tables/core";
  import type { Location } from "$lib/types";
  import type { AnyPlugins } from "svelte-headless-table/plugins";

  import ConstraintsList from "$lib/components/elements/constraint/constraints-for-list.svelte"; import DataTable from "$lib/components/elements/data-tables/core/data-table.svelte";
  import RowActions from "$lib/components/elements/data-tables/lib/row-actions.svelte";
  import LocationBadge from "$lib/components/elements/location/location-badge.svelte";
  import { getConstraintsFor, locations } from "$lib/stores.ts";
  import { capitalize } from "$lib/utils/utils.ts";
  import { type Writable,writable } from "svelte/store";
  import {
    createRender,
    DataBodyCell,
    FlatColumn,
    type ReadOrWritable
  } from "svelte-headless-table";
  import { createSortKeysStore, type WritableSortKeys } from "svelte-headless-table/plugins";

  let data: ReadOrWritable<Location[]> = locations;
  let actions: Map<string, (item: Location) => void> = new Map();
  let filterValue: Writable<string> = writable("");
  let sortKeys: WritableSortKeys = createSortKeysStore([]);
  let hideForId: { [key: string]: boolean } = {};
  let flatColumns: FlatColumn<Location, AnyPlugins, string>[];
  let className: string = "";

  let columnInitializers: ColumnInitializer[] = [
    {
      accessor: (row: Location) => row,
      cell: (cell: DataBodyCell<unknown>) =>
        createRender(LocationBadge, { location: cell.value as Location }),
      header: "Image",
      id: "image",
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
      accessor: "address",
      header: "Address",
      id: "address"
    },
    {
      accessor: (row: Location) => row,
      cell: (cell: DataBodyCell<unknown>) =>
        createRender(ConstraintsList, { forOperand: cell.value as Location }),
      header: "Constraints",
      id: "constraints",
      plugins: {
        sort: {
          getSortValue: (value: Location) =>
            getConstraintsFor(value)
              .map((constraint) => constraint.type)
              .join(" ")
        },
        tableFilter: {
          getFilterValue: (value: Location) =>
            getConstraintsFor(value)
              .map((constraint) => constraint.type)
              .join(" ")
        }
      }
    }
  ];

  if (actions.size > 0) {
    columnInitializers.push({
      accessor: (row: Location) => row,
      cell: (cell: DataBodyCell<unknown>) =>
        createRender(RowActions, { actions, item: cell.value as Location }),
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

  export { actions, className as class,data, filterValue, flatColumns, hideForId, sortKeys };
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
