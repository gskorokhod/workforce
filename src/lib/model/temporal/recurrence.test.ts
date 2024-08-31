/* eslint-disable sonarjs/no-duplicate-string */
import {
  fromDate,
  parseZonedDateTime,
  toCalendarDate,
  toTimeZone,
  ZonedDateTime
} from "@internationalized/date";
import { datetime, RRule } from "rrule";
import { expect, test } from "vitest";
import { DateOption, Recurrence, type RecurrenceOptions } from "./recurrence";
import { toUTCDate } from "./utils";

test("Construct a Recurrence", () => {
  const opts: RecurrenceOptions = {
    count: 5,
    dtstart: datetime(2012, 2, 1, 10, 30),
    freq: RRule.MONTHLY
  };

  const recurrence = new Recurrence({
    rRuleOptions: opts
  });

  expect(recurrence).toBeDefined();
});

test("Get the start date", () => {
  const dtstart = datetime(2012, 2, 1, 10, 30);
  const opts: RecurrenceOptions = {
    count: 5,
    dtstart,
    freq: RRule.MONTHLY
  };

  const recurrence = new Recurrence({
    rRuleOptions: opts
  });

  const sdt = recurrence.getStartDT();

  expect(sdt).toBeDefined();
  expect(sdt).not.toBeNull();
  expect(toUTCDate(sdt as ZonedDateTime).valueOf).toEqual(dtstart.valueOf);
});

test("Get the start date with a time zone", () => {
  const zdtStart = parseZonedDateTime("2012-02-01T10:30[America/New_York]");
  const recurrence = new Recurrence({
    rRuleOptions: {
      count: 5,
      freq: RRule.MONTHLY
    },
    dtStart: zdtStart
  });

  const sdt = recurrence.getStartDT(0, "America/New_York");

  expect(sdt).toBeDefined();
  expect(sdt).not.toBeNull();
  expect(sdt?.compare(zdtStart)).toEqual(0);

  const utc = recurrence.getStartDT(0, "UTC");
  expect(utc).toBeDefined();
  expect(utc).not.toBeNull();
  expect(utc?.compare(toTimeZone(zdtStart, "UTC"))).toEqual(0);
});

test("Occurrence count", () => {
  const opts: RecurrenceOptions = {
    count: 5,
    dtstart: datetime(2012, 2, 1, 10, 30),
    freq: RRule.MONTHLY
  };

  const recurrence = new Recurrence({
    rRuleOptions: opts
  });

  const occurrences = recurrence.getOccurrences();
  expect(occurrences).toBeDefined();
  expect(occurrences).toHaveLength(5);
});

test("Check for clashes", () => {
  const opts1: RecurrenceOptions = {
    count: 5,
    dtstart: datetime(2012, 2, 1, 10, 30),
    freq: RRule.MONTHLY
  };

  const opts2: RecurrenceOptions = {
    count: 5,
    dtstart: datetime(2012, 2, 1, 10, 30),
    freq: RRule.MONTHLY
  };

  const recurrence1 = new Recurrence({
    rRuleOptions: opts1
  });

  const recurrence2 = new Recurrence({
    rRuleOptions: opts2
  });

  const clashes = recurrence1.clashesWith(recurrence2);
  expect(clashes).toBe(true);
});

test("Get clashes", () => {
  const opts1: RecurrenceOptions = {
    count: 5,
    dtstart: datetime(2012, 2, 1, 10, 30),
    freq: RRule.MONTHLY
  };

  const opts2: RecurrenceOptions = {
    count: 5,
    dtstart: datetime(2012, 2, 1, 10, 30),
    freq: RRule.MONTHLY
  };

  const recurrence1 = new Recurrence({
    rRuleOptions: opts1
  });

  const recurrence2 = new Recurrence({
    rRuleOptions: opts2
  });

  const clashes = recurrence1.getClashes(recurrence2);
  expect(clashes).toBeDefined();
  expect(clashes).toHaveLength(5);
});

test("Set and get date status", () => {
  const dtstart = datetime(2012, 2, 1, 10, 30);
  const opts: RecurrenceOptions = {
    count: 5,
    dtstart,
    freq: RRule.MONTHLY
  };

  const recurrence = new Recurrence({
    rRuleOptions: opts
  });

  const date = toCalendarDate(fromDate(dtstart, "UTC"));
  recurrence.setDateStatus(date, DateOption.EXCLUDED);

  const status = recurrence.getDateStatus(date);
  expect(status).toEqual(DateOption.EXCLUDED);
});

test("Get exceptions", () => {
  const zdtStart = parseZonedDateTime("2012-02-01T10:30[UTC]");
  const opts: RecurrenceOptions = {
    count: 5,
    freq: RRule.MONTHLY
  };

  const recurrence = new Recurrence({
    rRuleOptions: opts,
    dtStart: zdtStart
  });

  const date = toCalendarDate(zdtStart);
  recurrence.setDateStatus(date, DateOption.EXCLUDED);

  const exceptions = recurrence.getExceptions();
  expect(exceptions).toBeDefined();
  expect(exceptions.size).toBe(1);

  const keys = Array.from(exceptions.keys());
  expect(keys).toHaveLength(1);
  expect(keys[0]).toEqual(date);

  expect(recurrence.getDateStatus(date)).toEqual(DateOption.EXCLUDED);
  expect(exceptions.get(date)).toEqual(DateOption.EXCLUDED);
});

test("Set and get duration", () => {
  const dtstart = datetime(2012, 2, 1, 10, 30);
  const opts: RecurrenceOptions = {
    count: 5,
    dtstart,
    freq: RRule.MONTHLY
  };

  const recurrence = new Recurrence({
    rRuleOptions: opts
  });

  const duration = { hours: 2 };
  recurrence.setDuration(duration);

  expect(recurrence.duration).toEqual(duration);
});

test("Get last occurrence", () => {
  const zdt = parseZonedDateTime("2012-02-01T10:30[UTC]");
  const expected = parseZonedDateTime("2012-06-01T10:30[UTC]");
  const opts: RecurrenceOptions = {
    count: 5,
    freq: RRule.MONTHLY
  };

  const recurrence = new Recurrence({
    rRuleOptions: opts,
    dtStart: zdt,
    duration: { hours: 2 }
  });

  // Get the last occurrence
  const last = recurrence.getOccurrence(-1, "UTC");
  expect(last).toBeDefined();
  expect(last).not.toBeNull();
  expect(last?.start).toEqual(expected);

  // This should return the same result as the previous call
  const last2 = recurrence.getOccurrence(4, "UTC");
  expect(last2).toBeDefined();
  expect(last2).not.toBeNull();
  expect(last2?.start).toEqual(expected);
});

test("Update options", () => {
  const dtstart = datetime(2012, 2, 1, 10, 30);
  const opts: RecurrenceOptions = {
    count: 5,
    dtstart,
    freq: RRule.MONTHLY
  };

  const recurrence = new Recurrence({
    rRuleOptions: opts
  });

  const newOpts: RecurrenceOptions = {
    freq: RRule.WEEKLY
  };

  recurrence.updateOptions(newOpts);

  expect(recurrence.options.freq).toEqual(RRule.WEEKLY);
  expect(recurrence.options.count).toEqual(5);
  expect(recurrence.options.dtstart).toEqual(dtstart);

  const last = recurrence.getOccurrence(-1);
  expect(last).toBeDefined();
  expect(last).not.toBeNull();

  // The pattern is now weekly, so the last occurrence should be 4 weeks after the start date
  const date = toUTCDate(last?.start as ZonedDateTime);
  expect(date.valueOf).toEqual(datetime(2012, 2, 29, 10, 30).valueOf);
});

test("Probe method", () => {
  const zdtStart = parseZonedDateTime("2012-02-01T10:30[UTC]");
  const recurrence = new Recurrence({
    rRuleOptions: {
      count: 5,
      freq: RRule.MONTHLY
    },
    dtStart: zdtStart
  });

  const probeResult = recurrence.probe(zdtStart);
  expect(probeResult).toBeDefined();
  expect(probeResult.matchesPattern).toBe(true);
  expect(probeResult.status).toBe(DateOption.ALLOWED);
  expect(probeResult.occurrence).toBeDefined();
});

test("Set start date", () => {
  const zdtStart = parseZonedDateTime("2012-02-01T10:30[UTC]");
  const newStart = parseZonedDateTime("2013-03-01T10:30[UTC]");
  const recurrence = new Recurrence({
    rRuleOptions: {
      count: 5,
      freq: RRule.MONTHLY
    },
    dtStart: zdtStart
  });

  recurrence.setStartDT(newStart);
  const sdt = recurrence.getStartDT(0, "UTC");
  expect(sdt).toBeDefined();
  expect(sdt?.compare(newStart)).toEqual(0);
});

test("Get occurrences within date range", () => {
  const zdtStart = parseZonedDateTime("2012-02-01T10:30[UTC]");
  const recurrence = new Recurrence({
    rRuleOptions: {
      count: 5,
      freq: RRule.MONTHLY
    },
    dtStart: zdtStart
  });

  let after = parseZonedDateTime("2012-02-01T10:30[UTC]");
  let before = parseZonedDateTime("2012-06-01T10:30[UTC]");
  let occurrences = recurrence.getOccurrences(after, before, "UTC");

  expect(occurrences).toBeDefined();
  expect(occurrences).toHaveLength(5);

  after = parseZonedDateTime("2012-03-01T10:30[UTC]");
  before = parseZonedDateTime("2012-05-01T10:30[UTC]");
  occurrences = recurrence.getOccurrences(after, before, "UTC");

  expect(occurrences).toBeDefined();
  expect(occurrences).toHaveLength(3);
});

test("Infinite recurrence", () => {
  const zdtStart = parseZonedDateTime("2012-02-01T10:30[UTC]");
  const recurrence = new Recurrence({
    rRuleOptions: {
      freq: RRule.MONTHLY
    },
    dtStart: zdtStart
  });

  expect(recurrence.isFinite).toBe(false);

  let occurrences = recurrence.getOccurrences();
  expect(occurrences).toBeDefined();
  expect(occurrences).toHaveLength(100); // Default limit

  const last = recurrence.getOccurrence(-1);
  expect(last).toBeNull(); // No end date

  const after = parseZonedDateTime("2012-02-01T10:30[UTC]");
  const before = parseZonedDateTime("2112-02-01T00:00[UTC]");
  occurrences = recurrence.getOccurrences(after, before, "UTC");
  expect(occurrences).toBeDefined();
  expect(occurrences).toHaveLength(1200); // All occurrences within the range. 100 years * 12 months = 1200.
});
