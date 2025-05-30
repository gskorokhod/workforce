<!-- Need this due to the way the svelte-headless-table library is written -->
<!-- eslint-disable  @typescript-eslint/no-explicit-any -->
<script lang="ts" generics="T, V = any">
  import ActionsBtn from "./actions-btn.svelte";

  import { Button } from "$lib/components/ui/button";
  import * as Table from "$lib/components/ui/table";
  import { cn } from "$lib/utils/ui";
  import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-svelte";
  import {
    BodyRow,
    createRender,
    createTable,
    DataBodyRow,
    type ReadOrWritable,
    Render,
    Subscribe,
  } from "svelte-headless-table";
  import {
    addHiddenColumns,
    addPagination,
    addSelectedRows,
    addSortBy,
    addTableFilter,
    type PaginationConfig,
    type SortByConfig,
  } from "svelte-headless-table/plugins";
  import type { ColumnInitializer, RowActions } from ".";

  let header = false;
  let data: ReadOrWritable<T[]>;
  let actions: RowActions<T> = new Map();
  let defaultAction: (item: T) => void = () => {};
  let columnInitializers: ColumnInitializer<T, V>[] = [];
  let paginationConfig: PaginationConfig | undefined = undefined;
  let sortByConfig: SortByConfig | undefined = undefined;
  let className = "";
  let table = createTable(data, {
    hide: addHiddenColumns(),
    page: addPagination(paginationConfig),
    select: addSelectedRows(),
    sort: addSortBy(sortByConfig),
    tableFilter: addTableFilter({
      fn: ({ filterValue, value }) => {
        return value.toLowerCase().includes(filterValue.toLowerCase());
      },
    }),
  });

  const actionsCol: ColumnInitializer<T> = {
    accessor: (row) => row,
    cell: (cell) => createRender(ActionsBtn<T>, { actions, item: cell.value }),
    header: "Actions",
    id: "actions",
    plugins: {
      sort: {
        disable: true,
      },
      tableFilter: {
        disable: true,
      },
    },
  };
  const colInits = [...columnInitializers, actionsCol];
  const columns = table.createColumns(colInits.map((col) => table.column(col)));
  const { flatColumns, headerRows, pageRows, pluginStates, tableAttrs, tableBodyAttrs } =
    table.createViewModel(columns);
  const { hasNextPage, hasPreviousPage, pageIndex } = pluginStates.page;
  const { filterValue } = pluginStates.tableFilter;
  const { sortKeys } = pluginStates.sort;
  const { hiddenColumnIds } = pluginStates.hide;
  const { selectedDataIds } = pluginStates.select;

  let hideForId: Record<string, boolean> = {};
  $: $hiddenColumnIds = Object.entries(hideForId)
    .filter(([, hide]) => hide)
    .map(([id]) => id);

  function handleRowClick(e: Event, row: BodyRow<T>) {
    const target = e.target as HTMLElement;
    if (target?.closest("button") === null) {
      rowClicked(row);
    }
  }

  function rowClicked(row: BodyRow<T>) {
    console.log("row clicked", row);
    if (row.isData()) {
      const drow = row as DataBodyRow<T>;
      defaultAction(drow.original);
    }
  }

  export {
    className as class,
    columnInitializers,
    data,
    actions,
    defaultAction,
    filterValue,
    flatColumns,
    hideForId,
    selectedDataIds,
    sortKeys,
    header,
  };
</script>

<div class="border bg-background {header ? 'rounded-b-md' : 'rounded-md'} {className}">
  <Table.Root {...$tableAttrs}>
    <Table.Header>
      {#each $headerRows as headerRow (headerRow.id)}
        <Subscribe let:rowAttrs rowAttrs={headerRow.attrs()}>
          <Table.Row {...rowAttrs}>
            {#each headerRow.cells as cell (cell.id)}
              <Subscribe attrs={cell.attrs()} let:attrs let:props props={cell.props()}>
                <Table.Head {...attrs} class={cn("text-sm", "[&:has([role=checkbox])]:pl-3")}>
                  {#if props.sort.disabled}
                    <Render of={cell.render()} />
                  {:else}
                    <Button on:click={props.sort.toggle} size="sm" variant="ghost">
                      <Render of={cell.render()} />
                      {#if props.sort.order === "asc"}
                        <ArrowUp
                          class={cn(
                            $sortKeys[0]?.id === cell.id && "text-foreground",
                            "ml-2 h-4 w-4",
                          )}
                        />
                      {:else if props.sort.order === "desc"}
                        <ArrowDown
                          class={cn(
                            $sortKeys[0]?.id === cell.id && "text-foreground",
                            "ml-2 h-4 w-4",
                          )}
                        />
                      {:else}
                        <ArrowUpDown
                          class={cn(
                            $sortKeys[0]?.id === cell.id && "text-foreground",
                            "ml-2 h-4 w-4",
                          )}
                        />
                      {/if}
                    </Button>
                  {/if}
                </Table.Head>
              </Subscribe>
            {/each}
          </Table.Row>
        </Subscribe>
      {/each}
    </Table.Header>
    <Table.Body {...$tableBodyAttrs}>
      {#each $pageRows as row (row.id)}
        <Subscribe let:rowAttrs rowAttrs={row.attrs()}>
          <Table.Row {...rowAttrs} on:click={(e) => handleRowClick(e, row)}>
            {#each row.cells as cell (cell.id)}
              <Subscribe attrs={cell.attrs()} let:attrs props={cell.props()}>
                <Table.Cell class="[&:has([role=checkbox])]:pl-3" {...attrs}>
                  <Render of={cell.render()} />
                </Table.Cell>
              </Subscribe>
            {/each}
          </Table.Row>
        </Subscribe>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
<div class="flex w-full items-center justify-end space-x-4 px-4 pt-4">
  <Button
    disabled={!$hasPreviousPage}
    on:click={() => ($pageIndex = $pageIndex - 1)}
    size="sm"
    variant="outline"
    >Previous
  </Button>
  <Button
    disabled={!$hasNextPage}
    on:click={() => ($pageIndex = $pageIndex + 1)}
    size="sm"
    variant="outline"
    >Next
  </Button>
</div>
