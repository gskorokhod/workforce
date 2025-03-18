import { CalendarDate, getLocalTimeZone, parseZonedDateTime } from "@internationalized/date";
import { RRule } from "rrule";
import { describe, expect, it } from "vitest";
import type { RecurrenceOptions } from "./options";
import { Recurrence } from "./recurrence";

const sampleRule: Partial<RecurrenceOptions> = {
  freq: RRule.WEEKLY,
  interval: 1,
  byweekday: [RRule.MO, RRule.WE, RRule.FR],
  dtstart: parseZonedDateTime("2024-01-01T00:00[Europe/London]"),
  until: parseZonedDateTime("2024-01-31T00:00[Europe/London]"),
};

const sampleProps = {
  rule: sampleRule,
  tzid: getLocalTimeZone(),
  duration: { hours: 1 },
  rdates: [new CalendarDate(2024, 1, 1)],
  exdates: [new CalendarDate(2024, 1, 3)],
};

describe("Recurrence", () => {
  it("should initialize correctly", () => {
    const recurrence = new Recurrence(sampleProps);
    expect(recurrence).toBeDefined();
    expect(recurrence.tzid).toBe(sampleProps.tzid);
    expect(recurrence._duration).toEqual(sampleProps.duration);
    expect(recurrence.rdates).toEqual(sampleProps.rdates);
    expect(recurrence.exdates).toEqual(sampleProps.exdates);
  });

  it("should create a deep copy", () => {
    const recurrence = new Recurrence(sampleProps);
    const copy = recurrence.copy();
    expect(copy).toEqual(recurrence);
    expect(copy).not.toBe(recurrence);
  });

  it("should get the nth occurrence", () => {
    const recurrence = new Recurrence(sampleProps);
    const occurrence = recurrence.occurrence(0);
    expect(occurrence).toBeDefined();
  });

  it("should get all occurrences within a range", () => {
    const recurrence = new Recurrence(sampleProps);

    const after = parseZonedDateTime("2024-01-01T00:00[Europe/London]");
    const before = parseZonedDateTime("2024-01-05T00:00[Europe/London]");
    const occurrences = recurrence.occurrences(after, before);

    // Mon 01/01 - First occurrence
    // Tue 02/01 - Does not match
    // Wed 03/01 - Excluded
    // Thu 04/01 - Does not match
    // Fri 05/01 - Second occurrence

    expect(occurrences.length).toBe(2);
    expect(occurrences[0].start).toEqual(parseZonedDateTime("2024-01-01T00:00[Europe/London]"));
    expect(occurrences[1].start).toEqual(parseZonedDateTime("2024-01-05T00:00[Europe/London]"));
  });

  it("should detect clashes between non-overlapping patterns", () => {
    const recurrence1 = new Recurrence(sampleProps);
    const recurrence2 = new Recurrence({
      ...sampleProps,
      rdates: [],
      rule: { ...sampleRule, byweekday: [RRule.TU, RRule.TH] },
    });
    const clashes = recurrence1.clashes(recurrence2);
    expect(clashes.length).toBe(0);
  });

  it("should detect clashes between overlapping patterns", () => {
    const recurrence1 = new Recurrence(sampleProps);
    const recurrence2 = new Recurrence({
      ...sampleProps,
      rule: { ...sampleRule, byweekday: [RRule.MO, RRule.WE] },
    });

    const clashes = recurrence1.clashes(recurrence2);
    expect(clashes).toEqual(recurrence2.occurrences());
  });

  it("should update properties correctly", () => {
    const recurrence = new Recurrence(sampleProps);
    const updated = recurrence.update({ duration: { hours: 2 } });
    expect(updated._duration).toEqual({ hours: 2 });
  });

  it("should return a human-readable string", () => {
    const recurrence = new Recurrence(sampleProps);
    const text = recurrence.toText();
    expect(text).toBeDefined();
  });

  it("shoud serialise and deserialise correctly", () => {
    const recurrence = new Recurrence(sampleProps);
    const json = JSON.stringify(recurrence.toJSON());
    const deserialized = Recurrence.fromJSON(JSON.parse(json));
    expect(deserialized?.recurrenceOptions).toEqual(recurrence?.recurrenceOptions);
  });
});
