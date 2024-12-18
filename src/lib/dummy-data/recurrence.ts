import { Recurrence } from "$lib/model/temporal";
import type { RecurrenceOptions, RecurrenceProps } from "$lib/model/temporal/recurrence";
import { faker } from "@faker-js/faker";
import {
  CalendarDate,
  fromDate,
  isSameDay,
  toCalendarDate,
  type TimeDuration,
} from "@internationalized/date";
import { RRule, Weekday } from "rrule";
import { select, weighedSelect } from "./misc";

const FREQS = [RRule.DAILY, RRule.WEEKLY, RRule.MONTHLY];

const WEEKDAYS = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA, RRule.SU];

const INTERVALS = [1, 2, 3, 4, 5, 6, 7, 14, 21, 28];
const I_WEIGHTS = [30, 20, 10, 5, 1, 1, 1, 1, 1, 1];

function mkWeekdays(): Weekday[] {
  if (Math.random() < 0.5) {
    return [];
  }
  return WEEKDAYS.filter(() => Math.random() < 0.5);
}

function mkInterval(): number {
  return weighedSelect(INTERVALS, I_WEIGHTS);
}

function mkFreq(): number {
  return weighedSelect(FREQS, [50, 25, 1]);
}

function mkEnd(): { count: number } | { until: CalendarDate } {
  if (Math.random() < 0.5) {
    return { count: Math.floor(Math.random() * 50) };
  } else {
    return {
      until: toCalendarDate(
        fromDate(
          faker.date.soon({
            days: Math.floor(Math.random() * 100),
          }),
          "UTC",
        ),
      ),
    };
  }
}

function mkDuration(): TimeDuration {
  return {
    hours: Math.floor(Math.random() * 22) + 1,
    minutes: select([0, 15, 30, 45]),
  };
}

function mkExDates(): CalendarDate[] {
  const n = Math.floor(Math.random() * 5);
  return Array.from({ length: n }, () => {
    const dt = faker.date.between({
      from: faker.date.recent({ days: 14 }),
      to: faker.date.future(),
    });
    return toCalendarDate(fromDate(dt, "UTC"));
  });
}

function mkExceprions(): {
  rdates: CalendarDate[];
  exdates: CalendarDate[];
} {
  const exdates = mkExDates();
  const rdates = mkExDates().filter((d) => !exdates.some((e) => isSameDay(d, e)));
  return { rdates, exdates };
}

export function generateRecurrence(): Recurrence {
  const freq = mkFreq();
  const options: Partial<RecurrenceOptions> = {
    ...mkEnd(),
    freq,
    interval: mkInterval(),
    byweekday: freq === RRule.DAILY ? [] : mkWeekdays(),
    dtstart: fromDate(faker.date.recent({ days: 14 }), "UTC"),
  };

  const { rdates, exdates } = mkExceprions();
  const props: RecurrenceProps = {
    duration: mkDuration(),
    rdates,
    exdates,
    rule: options,
  };

  return new Recurrence(props);
}
