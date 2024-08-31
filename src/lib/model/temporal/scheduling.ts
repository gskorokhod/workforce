import {
  CalendarDate,
  DateTimeDuration,
  fromDate,
  toCalendarDate,
  ZonedDateTime
} from "@internationalized/date";
import { Frequency } from "rrule";
import { toRecurrenceOptions } from "./options";
import { DateOption, Recurrence } from "./recurrence";
import { calendarDaysBetween, calendarMonthsBetween, cycle, toUTCDate } from "./utils";

/**
 * Reschedule the recurrence pattern such that the given occurrence is moved by a given duration.
 * (If the occurrence is not part of this recurrence pattern, this method will return null.)
 *
 * @param occurrenceZDT ZonedDateTime of the occurrence to reschedule
 * @param by DateTimeDuration by which to move the occurrence
 * @param wholeSeries If this is true, the whole series will be rescheduled (see note). If false, only the given occurrence will be rescheduled (by adding an exception to the original recurrence pattern). Defaults to false.
 *
 * Note: this is intended to be used with a drag-and-drop interface, where the user can move a single occurrence of a recurring event, or the whole series.
 * By "rescheduling the whole series", we mean that the recurrence pattern itself is changed such that all events in the series are moved (as intuitively as possible).
 *
 * Specifically:
 *
 * - If the frequency is `DAILY`, the start date (and the end date, if it exists) is moved by the given duration.
 *   This will move all events in the series by the same amount. Equivalent to calling `offset`.
 *
 * - If the frequency is `WEEKLY`, the `byweekday` field is updated such that all events within a week are moved by the same amount.
 *   The `byweekday` offset will loop around, i.e. if the occurrence is on Friday and the user moves it by 3 days, the new occurrence will be on Monday of the following week.
 *
 * - If the frequency is `MONTHLY`:
 *     - If `bymonthday` is set, the days in `bymonthday` are moved by the given duration, looping around if necessary.
 *     - If `byweekday` is set, the days in `byweekday` are moved by the given duration, looping around if necessary.
 *     - If `bysetpos` is set and the offset is such that the event is moved to a different week, the `bysetpos` field is updated to reflect this.
 *   For example:
 *     - If the occurrence is the first Monday of the month and the user moves it by 1 day, the new occurrence will be the first Tuesday of the month.
 *     - If the occurrence is the first Monday of the month and the user moves it by 8 days, the new occurrence will be the second Tuesday of the month.
 *     - If the occurrence is the second day of the month and the user moves it by 8 days, the new occurrence will be the 10th day of the month.
 *
 * - In any case:
 *     - The start and end dates are moved by the given duration.
 *     - If `bymonth` is set and the new date is in a different month, the `bymonth` field is updated to reflect this.
 *
 * These semantics may change in the future.
 * TODO: Discuss any potential edge cases and how to handle them.
 */
export function reschedule(
  recurrence: Recurrence,
  occurrenceZDT: ZonedDateTime,
  by: DateTimeDuration,
  wholeSeries: boolean = false
): Recurrence | null {
  const startDT = recurrence.getStartDT(0, "UTC", false); // Get the start date in UTC, ignoring date exceptions
  if (startDT === null) return null;

  const thisEvent = recurrence.probe(occurrenceZDT);
  if (!thisEvent.occurrence || thisEvent.status === DateOption.EXCLUDED) return null;

  if (!wholeSeries) {
    const newEvent = recurrence.probe(thisEvent.date.add(by));
    const exceptions = new Map(recurrence.getExceptions());

    exceptions.set(
      toCalendarDate(thisEvent.date),
      thisEvent.matchesPattern ? DateOption.EXCLUDED : DateOption.ALLOWED
    );
    exceptions.set(
      toCalendarDate(newEvent.date),
      newEvent.matchesPattern ? DateOption.ALLOWED : DateOption.INCLUDED
    );

    return new Recurrence({
      dtStart: startDT,
      duration: recurrence.duration,
      exceptions: exceptions,
      rRuleOptions: recurrence.options
    });
  }

  switch (recurrence.options.freq) {
    case Frequency.DAILY:
      return offset(recurrence, by, true);
    case Frequency.WEEKLY:
      return rescheduleWeekly(recurrence, occurrenceZDT, by);
    case Frequency.MONTHLY:
      return null; // TODO: Implement rescheduling monthly events
  }

  return null;
}

function rescheduleWeekly(
  recurrence: Recurrence,
  occurrenceZDT: ZonedDateTime,
  by: DateTimeDuration
): Recurrence | null {
  const startDT = recurrence.getStartDT(0, "UTC", false); // Get the start date in UTC, ignoring date exceptions
  if (startDT === null) return null;

  const thisEvent = recurrence.probe(occurrenceZDT);
  if (!thisEvent.occurrence || thisEvent.status === DateOption.EXCLUDED) return null;

  const newStart = startDT.add(by);
  const newUntil = recurrence.options.until ? move(recurrence.options.until, by) : null;

  const daysOffset = calendarDaysBetween(startDT, newStart);
  const monthsOffset = calendarMonthsBetween(startDT, newStart);

  const options = recurrence.rawOptions;
  options.until = newUntil;
  options.dtstart = toUTCDate(newStart);
  options.byweekday = options.byweekday.map((wd) => cycle(wd, daysOffset, 0, 6));
  options.bymonth = options.bymonth.map((m) => cycle(m, monthsOffset, 1, 12));

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
 * Create a new recurrence pattern that is offset from this one by a given duration.
 * @param by DateTimeDuration by which to offset the recurrence pattern
 * @param moveExceptions If this is true, `rDates` and `exDates` will be moved along with the recurrence pattern. Otherwise, they will remain unchanged. Defaults to true.
 * @returns A new `Recurrence` object representing the offset recurrence pattern, or null if an error occurred.
 */
export function offset(
  recurrence: Recurrence,
  by: DateTimeDuration,
  withExceptions: boolean = true
): Recurrence | null {
  const sdt = recurrence.getStartDT(0, "UTC", false); // Get the start date in UTC, ignoring date exceptions
  if (sdt === null) return null;

  const options = recurrence.options;
  options.until = options.until ? move(fromDate(options.until, "UTC"), by) : null;

  const exceptions = withExceptions
    ? moveExceptions(recurrence.getExceptions(), by)
    : recurrence.getExceptions();

  return new Recurrence({
    dtStart: sdt.add(by),
    duration: this.duration,
    exceptions,
    rRuleOptions: options
  });
}

function moveExceptions(
  exceptions: Map<CalendarDate, DateOption>,
  by: DateTimeDuration
): Map<CalendarDate, DateOption> {
  const newExceptions: Map<CalendarDate, DateOption> = new Map();
  exceptions.forEach((value, key) => newExceptions.set(key.add(by), value));
  return newExceptions;
}

function move(date: Date | ZonedDateTime, by: DateTimeDuration): Date {
  if (date instanceof ZonedDateTime) return toUTCDate(date.add(by));
  return toUTCDate(fromDate(date, "UTC").add(by));
}
