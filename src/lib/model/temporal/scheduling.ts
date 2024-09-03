import type { DateTimeDuration } from "@internationalized/date";
import { CalendarDate, fromDate, toCalendarDate, ZonedDateTime } from "@internationalized/date";
import { toRecurrenceOptions } from "./options";
import { DateOption, Recurrence, TimeSlot } from "./recurrence";
import { calendarDaysBetween, cycle, toUTCDate } from "./utils";

export enum RescheduleMode {
  // Reschedule only the given occurrence
  SINGLE = "SINGLE",
  // Offset all occurrences by the given duration
  ALL = "ALL"
}

/**
 * Reschedule the recurrence pattern such that the given occurrence is moved by a given duration.
 * (If the occurrence is not part of this recurrence pattern, this method will return null.)
 *
 * @param occurrence ZonedDateTime of the occurrence to reschedule
 * @param by DateTimeDuration by which to move the occurrence
 * @param mode Reschedule mode
 *
 * Rescheduling modes:
 * - SINGLE: Reschedule only the given occurrence
 * - ALL: Offset all occurrences by the given duration
 * - (TODO: More modes?)
 *
 * These semantics may change in the future.
 * TODO: Discuss any potential edge cases and how to handle them.
 */
export function reschedule(
  recurrence: Recurrence,
  occurrence: ZonedDateTime | TimeSlot | undefined | null,
  by: DateTimeDuration,
  mode: RescheduleMode = RescheduleMode.SINGLE
): Recurrence | null {
  if (occurrence === undefined || occurrence === null) return null;

  let occurrenceZDT: ZonedDateTime;
  if (occurrence instanceof TimeSlot) {
    occurrenceZDT = occurrence.start;
  } else {
    occurrenceZDT = occurrence;
  }

  const thisEvent = recurrence.probe(occurrenceZDT);
  if (!thisEvent.occurrence) return null;

  switch (mode) {
    case RescheduleMode.SINGLE:
      return moveSingle(recurrence, occurrenceZDT, by);
    case RescheduleMode.ALL:
      return offset(recurrence, by);
  }

  return null;
}

/**
 * Reschedule a single occurrence of a recurrence pattern by adding an exception to the original pattern.
 * @param recurrence Recurrence pattern
 * @param occurrenceZDT ZonedDateTime of the occurrence to reschedule
 * @param by DateTimeDuration by which to move the occurrence
 * @returns new Recurrence object with the rescheduled occurrence, or null if an error occurred
 */
function moveSingle(
  recurrence: Recurrence,
  occurrenceZDT: ZonedDateTime,
  by: DateTimeDuration
): Recurrence | null {
  const thisEvent = recurrence.probe(occurrenceZDT);
  if (!thisEvent.occurrence) return null;

  const newEvent = recurrence.probe(thisEvent.date.add(by));
  const exceptions = recurrence.getExceptions();

  exceptions.set(
    toCalendarDate(thisEvent.date),
    thisEvent.matchesPattern ? DateOption.EXCLUDED : DateOption.ALLOWED
  );
  exceptions.set(
    toCalendarDate(newEvent.date),
    newEvent.matchesPattern ? DateOption.ALLOWED : DateOption.INCLUDED
  );

  return new Recurrence({
    dtStart: recurrence.dtStart,
    duration: recurrence.duration,
    exceptions: exceptions,
    rRuleOptions: recurrence.options
  });
}

/**
 * Create a new recurrence pattern, such that all occurrences are moved by a given duration.
 * Note: This is best-effort and may not work as expected for all recurrence patterns.
 *
 * @param recurrence Recurrence pattern to offset
 * @param occurrenceZDT Occurrence to offset
 * @param by Duration by which to offset the occurrence
 * @returns new Recurrence object with the occurrence offset, or null if an error occurred
 */
function offset(recurrence: Recurrence, by: DateTimeDuration): Recurrence | null {
  const startDT = recurrence.dtStart;
  const newStart = startDT.add(by);
  const daysOffset = calendarDaysBetween(startDT, newStart);

  const options = recurrence.rawOptions;
  options.dtstart = toUTCDate(newStart);
  options.until = recurrence.options.until ? moveDate(recurrence.options.until, by) : null;
  options.byweekday = options.byweekday
    ? options.byweekday.map((wd) => cycle(wd, daysOffset, 0, 6))
    : [];
  options.bymonthday = options.bymonthday
    ? options.bymonthday.map((d) => cycle(d, daysOffset, 1, 31))
    : [];
  options.bymonth = moveMonths(recurrence, by);

  const newOptions = toRecurrenceOptions(options);
  if (newOptions === null) return null;

  return new Recurrence({
    dtStart: newStart,
    duration: recurrence.duration,
    exceptions: moveExceptions(recurrence.getExceptions(), by),
    rRuleOptions: newOptions
  });
}

/**
 * Move the `bymonth` values of a recurrence pattern such that all occurrences are moved by a given duration.
 * @param recurrence Recurrence pattern
 * @param by Duration by which to move the occurrences
 * @returns new `bymonth` values of the recurrence pattern
 */
function moveMonths(recurrence: Recurrence, by: DateTimeDuration): number[] {
  if (!recurrence.options.bymonth) {
    return [];
  }

  const ans: Set<number> = new Set();

  const dtStart = recurrence.dtStart.copy();
  const dtEnd = dtStart.add({ years: 1 });
  const occurrences = recurrence.getOccurrences(dtStart, dtEnd, "UTC");

  for (const occurrence of occurrences) {
    const newDt = occurrence.start.add(by);
    ans.add(newDt.month);
  }

  return Array.from(ans).sort();
}

function moveExceptions(
  exceptions: Map<CalendarDate, DateOption>,
  by: DateTimeDuration
): Map<CalendarDate, DateOption> {
  const newExceptions: Map<CalendarDate, DateOption> = new Map();
  exceptions.forEach((value, key) => newExceptions.set(key.add(by), value));
  return newExceptions;
}

function moveDate(date: Date | ZonedDateTime, by: DateTimeDuration): Date {
  if (date instanceof ZonedDateTime) return toUTCDate(date.add(by));
  return toUTCDate(fromDate(date, "UTC").add(by));
}
