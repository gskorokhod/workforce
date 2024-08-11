<script lang="ts">
  import type { Location, Person } from "$lib/types";
  import { getConstraintsFor, locations } from "$lib/stores.ts";
  import { createRender, DataBodyCell, FlatColumn, type ReadOrWritable } from "svelte-headless-table";
  import LocationBadge from "$lib/components/elements/location/location-badge.svelte";
  import DataTable from "$lib/components/elements/data-tables/core/data-table.svelte";
  import { writable, type Writable } from "svelte/store";
  import { createSortKeysStore, type WritableSortKeys } from "svelte-headless-table/plugins";
  import { capitalize } from "$lib/utils.ts";
  import ConstraintsList from "$lib/components/elements/constraint/constraints-for-list.svelte";
  import type { AnyPlugins } from "svelte-headless-table/plugins";
  import type { ColumnInitializer } from "$lib/components/elements/data-tables/core";
  import RowActions from "$lib/components/elements/data-tables/lib/row-actions.svelte";

  let data: ReadOrWritable<Location[]> = locations;
  let actions: Map<string, (item: Location) => void> = new Map();
  let filterValue: Writable<string> = writable("");
  let sortKeys: WritableSortKeys = createSortKeysStore([]);
  let hideForId: { [key: string]: boolean } = {};
  let flatColumns: FlatColumn<Location, AnyPlugins, string>[];
  let className: string = "";

  let columnInitializers: ColumnInitializer[] = [
    {
      id: "image",
      accessor: (row: Location) => row,
      header: "Image",
      cell: (cell: DataBodyCell<unknown>) => createRender(LocationBadge, { location: cell.value as Location }),
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
      id: "address",
      accessor: "address",
      header: "Address"
    },
    {
      id: "constraints",
      accessor: (row: Location) => row,
      header: "Constraints",
      cell: (cell: DataBodyCell<unknown>) => createRender(ConstraintsList, { forOperand: cell.value as Location }),
      plugins: {
        tableFilter: {
          getFilterValue: (value: Location) => getConstraintsFor(value).map((constraint) => constraint.type).join(" ")
        },
        sort: {
          getSortValue: (value: Location) => getConstraintsFor(value).map((constraint) => constraint.type).join(" ")
        }
      }
    }
  ];

  if (actions.size > 0) {
    columnInitializers.push({
      id: "actions",
      accessor: (row: Location) => row,
      header: "Actions",
      cell: (cell: DataBodyCell<unknown>) => createRender(RowActions, { item: cell.value as Location, actions }),
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
