import type { DateTimeDuration } from "@internationalized/date";
import {
  CalendarDate,
  getDayOfWeek,
  parseZonedDateTime,
  toCalendarDate,
  ZonedDateTime
} from "@internationalized/date";
import { Frequency, RRule } from "rrule";
import { beforeEach, describe, expect, it } from "vitest";
import { DateOption, Recurrence } from "./recurrence";
import { reschedule, RescheduleMode } from "./scheduling";

describe("Rescheduling a DAILY recurrence", () => {
  let startZDT: ZonedDateTime;
  let recurrence: Recurrence;
  let by: DateTimeDuration;

  beforeEach(() => {
    startZDT = parseZonedDateTime("2023-01-01T00:00[UTC]");

    recurrence = new Recurrence({
      dtstart: startZDT,
      duration: { hours: 1 },
      rrule: {
        freq: Frequency.DAILY,
        count: 5,
        interval: 2
      },
      exceptions: new Map<CalendarDate, DateOption>([
        // 03-01-2023 is the 1st occurrence and matches the pattern
        [toCalendarDate(startZDT.add({ days: 2 })), DateOption.INCLUDED],
        // 04-01-2023 is excluded, but does not match the pattern anyway
        [toCalendarDate(startZDT.add({ days: 3 })), DateOption.EXCLUDED],
        // 05-01-2023 matches the pattern, but is excluded (it would be the 2nd occurrence otherwise)
        [toCalendarDate(startZDT.add({ days: 4 })), DateOption.EXCLUDED],
        // 06-01-2023 does not match the pattern, but is included - it is the actual 2nd occurrence
        [toCalendarDate(startZDT.add({ days: 5 })), DateOption.INCLUDED]
      ])
    });
    // Expected occurrences:
    // 01-01-2023 00:00
    // 03-01-2023 00:00
    // - 05-01-2023 00:00 (excluded)
    // + 06-01-2023 00:00 (exceptional)
    // 07-01-2023 00:00
    // 09-01-2023 00:00

    by = { days: 1 };
  });

  it("handles exceptions correctly to begin with", () => {
    // 0th occurrence (start date) should be included
    expect(recurrence.getOccurrence(0, "UTC")?.start).toEqual(startZDT);
    let probe = recurrence.probe(startZDT);
    expect(probe.matchesPattern).toBe(true);
    expect(probe.status).toEqual(DateOption.ALLOWED);
    expect(probe.occurrence).not.toBeUndefined();

    // 1st occurrence should be included
    expect(recurrence.getOccurrence(1, "UTC")?.start).toEqual(startZDT.add({ days: 2 }));
    probe = recurrence.probe(startZDT.add({ days: 2 }));
    expect(probe.matchesPattern).toBe(true);
    expect(probe.status).toEqual(DateOption.INCLUDED);
    expect(probe.occurrence).not.toBeUndefined();

    // 5th day matches the pattern, but is excluded
    probe = recurrence.probe(startZDT.add({ days: 4 }));
    expect(probe.matchesPattern).toBe(true);
    expect(probe.status).toEqual(DateOption.EXCLUDED);
    expect(probe.occurrence).toBeUndefined();

    // 2nd occurrence is exceptional
    expect(recurrence.getOccurrence(2, "UTC")?.start).toEqual(startZDT.add({ days: 5 }));
    probe = recurrence.probe(startZDT.add({ days: 5 }));
    expect(probe.matchesPattern).toBe(false);
    expect(probe.status).toEqual(DateOption.INCLUDED);
  });

  it("should overwrite exceptions for day 3 and 4", () => {
    const occurrence = recurrence.getOccurrence(1, "UTC");
    expect(occurrence).not.toBeNull();
    expect(occurrence?.start).toEqual(startZDT.add({ days: 2 }));

    // Reschedule the 1st occurrence (day 3) by 1 day (to day 4)
    const newRecurrence = reschedule(recurrence, by, RescheduleMode.SINGLE, occurrence);
    expect(newRecurrence).not.toBeNull();
    const newOccurrence = newRecurrence?.getOccurrence(1, "UTC");
    expect(newOccurrence?.start).toEqual(occurrence?.start.add(by));

    const day3 = toCalendarDate(parseZonedDateTime("2023-01-03T00:00[UTC]"));
    const day4 = toCalendarDate(parseZonedDateTime("2023-01-04T00:00[UTC]"));

    // Day 3 should be excluded
    expect(newRecurrence?.checkException(day3)).toEqual(DateOption.EXCLUDED);

    // Day 4 should be included
    expect(newRecurrence?.checkException(day4)).toEqual(DateOption.INCLUDED);
  });

  it("should not reschedule a non-occurrence", () => {
    // There would be an occurrence on the 4th day, but it's excluded
    const newRecurrence = reschedule(
      recurrence,
      by,
      RescheduleMode.SINGLE,
      startZDT.add({ days: 4 })
    );
    // .. so it should return undefined
    expect(newRecurrence).toBeUndefined();
  });

  it("should reschedule an exceptional occurrence", () => {
    const minusBy = { days: -1 };

    const occurrence = recurrence.getOccurrence(2, "UTC");
    expect(occurrence).not.toBeNull();
    expect(occurrence?.start).toEqual(startZDT.add({ days: 5 }));

    // Reschedule the 2nd occurrence (day 6) by -1 day (to day 5)
    const newRecurrence = reschedule(recurrence, minusBy, RescheduleMode.SINGLE, occurrence);
    expect(newRecurrence).not.toBeNull();

    const newOccurrence = newRecurrence?.getOccurrence(2, "UTC");
    expect(newOccurrence?.start).toEqual(occurrence?.start.add(minusBy));

    // The new date matches the pattern, so it should not be exceptional
    const day5 = newRecurrence?.probe(newOccurrence?.start as ZonedDateTime);
    expect(day5?.matchesPattern).toBe(true);
    expect(day5?.status).toEqual(DateOption.ALLOWED);
    expect(day5?.occurrence).not.toBeUndefined();

    // The old date was exceptional, so the exception should be removed
    const day6 = newRecurrence?.probe(occurrence?.start as ZonedDateTime);
    expect(day6?.matchesPattern).toBe(false);
    expect(day6?.status).toEqual(DateOption.ALLOWED);
    expect(day6?.occurrence).toBeUndefined();
  });

  it("should reschedule the whole series", () => {
    const newRecurrence = reschedule(recurrence, by, RescheduleMode.ALL);
    expect(newRecurrence).not.toBeNull();

    // All occurrences, including the exceptional one, should be rescheduled by the specified duration
    const oldOccurrences = recurrence.getOccurrences();
    const newOccurrences = newRecurrence?.getOccurrences();

    expect(newOccurrences).toHaveLength(oldOccurrences.length);
    oldOccurrences.forEach((oldOccurrence, index) => {
      const newOccurrence = newOccurrences?.[index];
      expect(newOccurrence?.start).toEqual(oldOccurrence.start.add(by));
    });
  });
});

describe("Rescheduling a WEEKLY recurrence", () => {
  let startZDT: ZonedDateTime;
  let recurrence: Recurrence;

  beforeEach(() => {
    startZDT = parseZonedDateTime("2023-01-03T00:00[UTC]");

    recurrence = new Recurrence({
      dtstart: startZDT,
      duration: { hours: 1 },
      rrule: {
        freq: Frequency.WEEKLY,
        count: 12,
        byweekday: [RRule.MO, RRule.WE, RRule.FR],
        bymonth: [1] // January
      }
    });
    // Expected occurrences:
    // 04-01-2023 00:00 (Wednesday)
    // 06-01-2023 00:00 (Friday)
    // 09-01-2023 00:00 (Monday)
    // 11-01-2023 00:00 (Wednesday)
    // 13-01-2023 00:00 (Friday)
    // 16-01-2023 00:00 (Monday)
    // 18-01-2023 00:00 (Wednesday)
    // 20-01-2023 00:00 (Friday)
    // 23-01-2023 00:00 (Monday)
    // 25-01-2023 00:00 (Wednesday)
    // 27-01-2023 00:00 (Friday)
    // 30-01-2023 00:00 (Monday)
  });

  it("should reschedule a single occurrence", () => {
    const by = { days: 1 };

    const occurrence = recurrence.getOccurrence(1, "UTC");
    expect(occurrence).not.toBeNull();
    expect(occurrence?.start).toEqual(parseZonedDateTime("2023-01-06T00:00[UTC]"));

    const newRecurrence = reschedule(recurrence, by, RescheduleMode.SINGLE, occurrence);
    expect(newRecurrence).not.toBeNull();

    // The occurrence should be rescheduled by the specified duration
    const newOccurrence = newRecurrence?.getOccurrence(1, "UTC");
    expect(newOccurrence?.start).toEqual(occurrence?.start.add(by));

    // The recurrence start date should remain the same
    expect(newRecurrence?.dtStart).toEqual(startZDT);

    // The rest of the occurrences should remain the same
    const allOccurrences = recurrence.getOccurrences();
    const clashes = recurrence.getClashes(newRecurrence as Recurrence);
    expect(clashes).toHaveLength(allOccurrences.length - 1);
  });

  it("should reschedule the series by 1 day", () => {
    const by = { days: 1 };
    const occurrence = recurrence.getOccurrence(1, "UTC");

    const occurrenceDay = getDayOfWeek(occurrence?.start as ZonedDateTime, "en-GB");
    expect(occurrenceDay).toEqual(4); // Friday

    const newRecurrence = reschedule(recurrence, by, RescheduleMode.ALL);
    expect(newRecurrence).not.toBeNull();

    const newOccurrence = newRecurrence?.getOccurrence(1, "UTC");
    const newDay = getDayOfWeek(newOccurrence?.start as ZonedDateTime, "en-GB");
    expect(newDay).toEqual(5); // Saturday

    // All occurrences should be pushed forward by 1 day
    const oldOccurrences = recurrence.getOccurrences();
    const newOccurrences = newRecurrence?.getOccurrences();
    expect(newOccurrences).toHaveLength(oldOccurrences.length);
    oldOccurrences.forEach((oldOccurrence, index) => {
      const newOccurrence = newOccurrences?.[index];
      expect(newOccurrence?.start).toEqual(oldOccurrence.start.add(by));
    });
  });

  it("should reschedule the series by a week", () => {
    const by = { days: 7 };
    const occurrence = recurrence.getOccurrence(1, "UTC");

    const newRecurrence = reschedule(recurrence, by, RescheduleMode.ALL);
    expect(newRecurrence).not.toBeNull();

    const newOccurrence = newRecurrence?.getOccurrence(1, "UTC");
    expect(newOccurrence?.start).toEqual(occurrence?.start.add(by));

    const newDay = getDayOfWeek(newOccurrence?.start as ZonedDateTime, "en-GB");
    expect(newDay).toEqual(4); // Friday

    // Days of the week should remain the same (looping around)
    const dows = recurrence.recurrenceOptions.byweekday as number[];
    expect(newRecurrence?.recurrenceOptions.byweekday).toEqual(dows);

    // Some occurrences spill over into February
    expect(newRecurrence?.recurrenceOptions.bymonth).toEqual([1, 2]);

    // All occurrences should be pushed forward by 1 week
    const oldOccurrences = recurrence.getOccurrences();
    const occurrences = newRecurrence?.getOccurrences();
    expect(occurrences).toHaveLength(oldOccurrences.length);
    oldOccurrences.forEach((oldOccurrence, index) => {
      const newOccurrence = occurrences?.[index];
      expect(newOccurrence?.start).toEqual(oldOccurrence.start.add(by));
    });
  });

  it("should reschedule the series by a month", () => {
    const by = { days: 30 }; // Start: 03.01 -> 02.02
    const newRecurrence = reschedule(recurrence, by, RescheduleMode.ALL);
    expect(newRecurrence).not.toBeNull();

    // The `bymonth` values should be updated
    const bymonth = newRecurrence?.recurrenceOptions.bymonth as number[];
    expect(bymonth).toEqual([2, 3]);

    // All occurrences should be pushed forward by 30 days
    const oldOccurrences = recurrence.getOccurrences();
    const newOccurrences = newRecurrence?.getOccurrences();
    expect(newOccurrences).toHaveLength(oldOccurrences.length);
    oldOccurrences.forEach((oldOccurrence, index) => {
      const newOccurrence = newOccurrences?.[index];
      expect(newOccurrence?.start).toEqual(oldOccurrence.start.add(by));
    });
  });
});
