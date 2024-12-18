//import IntervalTree from "@flatten-js/interval-tree";
import type { CalendarDate, Time } from "@internationalized/date";
import type { Writable } from "svelte/store";

export interface CalendarProps {
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

export interface CalendarContext {
  props: Writable<CalendarProps>;
}

export interface TimeGridProps {
  start: Time;
  end: Time;
  step: number;
  precision: number;
  columnGap: string;
  showTime: boolean;
}

export interface TimeGridItem {
  start: Time;
  end: Time;
  key: string;
}

export interface TimeGridContext {
  startCols: Writable<Map<string, number>>;
  intervals: Writable<
    Map<
      string,
      {
        start: Time;
        end: Time;
      }
    >
  >;
  props: Writable<TimeGridProps>;
}
