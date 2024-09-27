import type { DataColumnInitBase, DataColumnInitFnAndId } from "svelte-headless-table";
import DataTableCore from "./data-table.svelte";
import type { AnyPlugins } from "svelte-headless-table/plugins";

export type RowActions<T> = Map<string, (item: T) => void>
export type ColumnInitializer<T, V = any> = DataColumnInitBase<T, AnyPlugins, V> &
  DataColumnInitFnAndId<T, string, V>;
export { DataTableCore };
