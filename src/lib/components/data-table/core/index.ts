import type { DataColumnInitBase, DataColumnInitFnAndId } from "svelte-headless-table";
import DataTableCore from "./data-table.svelte";

/* eslint-disable  @typescript-eslint/no-explicit-any */

export type RowActions<T> = Map<string, (item: T) => void>;
export type ColumnInitializer<T, V = any> = DataColumnInitBase<T, any, V> &
  DataColumnInitFnAndId<T, string, V>;
export { DataTableCore };
