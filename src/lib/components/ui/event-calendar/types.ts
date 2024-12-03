//import IntervalTree from "@flatten-js/interval-tree";
import type { CalendarDate, Time } from "@internationalized/date";
import type { Writable } from "svelte/store";

export type CalendarProps = {
  startDate: CalendarDate;
  endDate: CalendarDate;
  startTime: Time;
  endTime: Time;
  step: number;
  precision: number;
  line: string;
  columnGap: string;
  innerGap?: string;
}

export type CalendarContext = {
  props: Writable<CalendarProps>;
};

export type TimeGridProps = {
  start: Time;
  end: Time;
  step: number;
  precision: number;
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
  intervals: Writable<Map<string, {
    start: Time;
    end: Time;
  }>>;
  props: Writable<TimeGridProps>;
};
