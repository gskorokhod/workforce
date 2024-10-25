/* eslint-disable sonarjs/pseudo-random */
import { Recurrence } from "$lib/backend/temporal";
import type { RecurrenceOptions, RecurrenceProps } from "$lib/backend/temporal/recurrence";
import { faker } from "@faker-js/faker";
import { fromDate, type TimeDuration } from "@internationalized/date";
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

function mkEnd(): { count: number } | { until: Date } {
  if (Math.random() < 0.5) {
    return { count: Math.floor(Math.random() * 50) };
  } else {
    return { until: faker.date.future() };
  }
}

function mkDuration(): TimeDuration {
  return {
    hours: Math.floor(Math.random() * 22) + 1,
    minutes: select([0, 15, 30, 45])
  };
}

function mkExDates(): Date[] {
  const n = Math.floor(Math.random() * 5);
  return Array.from({ length: n }, () =>
    faker.date.between({
      from: faker.date.recent({ days: 14 }),
      to: faker.date.future()
    })
  );
}

function mkExceprions(): {
  rdates: Date[];
  exdates: Date[];
} {
  const exdates = mkExDates();
  const rdates = mkExDates().filter((d) => !exdates.some((e) => e.valueOf() === d.valueOf()));
  return { rdates, exdates };
}

export function generateRecurrence(): Recurrence {
  const freq = mkFreq();
  const options: RecurrenceOptions = {
    ...mkEnd(),
    freq,
    interval: mkInterval(),
    byweekday: freq === RRule.DAILY ? [] : mkWeekdays()
  };

  const dtstart = fromDate(faker.date.recent({ days: 14 }), "UTC");
  const props: RecurrenceProps = {
    dtstart,
    duration: mkDuration(),
    exceptions: mkExceprions(),
    rule: options
  };

  return new Recurrence(props);
}
