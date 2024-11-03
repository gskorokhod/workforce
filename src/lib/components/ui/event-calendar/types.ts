import IntervalTree from "@flatten-js/interval-tree";
import type { Time } from "@internationalized/date";
import type { Writable } from "svelte/store";

export type TimeGridProps = {
  start: Time;
  end: Time;
  step: number;
  precision: number;
  columns: number;
  columnGap: string;
  showTime: boolean;
};

export type TimeGridItem = {
  start: Time;
  end: Time;
  key: string;
};

export type TimeGridContext = {
  startCols: Writable<Map<string, number>>;
  intervals: Writable<IntervalTree<string>>;
  props: Writable<TimeGridProps>;
};
