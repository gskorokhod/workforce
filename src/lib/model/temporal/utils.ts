import {
  CalendarDate,
  CalendarDateTime,
  isSameDay,
  isSameMonth,
  isSameYear,
  startOfYear,
  toCalendar,
  toTimeZone,
  toZoned,
  ZonedDateTime
} from "@internationalized/date";

import { datetime } from "rrule";

/**
 * Converts a ZonedDateTime or CalendarDate to a Date object in UTC.
 * @param zdt ZonedDateTime or CalendarDate to convert
 * @returns Date object in UTC
 */
export function toUTCDate(dt: ZonedDateTime | CalendarDate): Date {
  if (dt instanceof CalendarDate) {
    return datetime(dt.year, dt.month, dt.day);
  }

  const d = toTimeZone(dt, "UTC").toDate();
  return datetime(
    d.getUTCFullYear(),
    d.getUTCMonth() + 1,
    d.getUTCDate(),
    d.getUTCHours(),
    d.getUTCMinutes(),
    d.getUTCSeconds()
  );
}

/**
 * Converts a Date object to its UTC equivalent.
 * @param d Date object to convert
 * @returns Date object in UTC
 */
export function localToUTC(d: Date): Date {
  d.getTimezoneOffset();
  return datetime(
    d.getUTCFullYear(),
    d.getUTCMonth() + 1,
    d.getUTCDate(),
    d.getUTCHours(),
    d.getUTCMinutes(),
    d.getUTCSeconds()
  );
}

/**
 * Checks if a date is in a list of dates (by UTC value).
 * @param date Date to check
 * @param dates Dates to check against
 * @returns True if the date is in the list, false otherwise
 */
export function hasDate(date: Date, dates: Date[]): boolean {
  return dates.map((d) => d.valueOf()).includes(date.valueOf());
}

/**
 * Get the quotient and remainder of a division operation.
 * @param a Numerator
 * @param b Denominator
 * @returns [quotient, remainder]
 */
export function divMod(a: number, b: number): [number, number] {
  return [Math.floor(a / b), a % b];
}

/**
 * Get the duration between two ZonedDateTime objects.
 * @param a Start date
 * @param b End date
 * @returns Duration between the two dates (in days, hours, minutes, seconds, and milliseconds)
 *
 * Note: the duration is calculated by absolute value
 */
export function durationBetween(a: ZonedDateTime, b: ZonedDateTime) {
  const totalMillis = Math.abs(a.toDate().valueOf() - b.toDate().valueOf());

  const [totalSeconds, millis] = divMod(totalMillis, 1000);
  const [totalMinutes, seconds] = divMod(totalSeconds, 60);
  const [totalHours, minutes] = divMod(totalMinutes, 60);
  const [days, hours] = divMod(totalHours, 24);

  return {
    days,
    hours,
    minutes,
    seconds,
    milliseconds: millis
  };
}

/**
 * Get the number of calendar days between two dates.
 * Note: the result is calculated by converting both dates to the UTC midnight of the same day, and then calculating the difference.
 *
 * @param start Start date.
 * @param end End date
 * @returns Number of calendar days between the two dates. If the start date is after the end date, the result will be negative.
 *
 * @example `calendarDaysBetween('2024-01-01', '2023-12-31')` -> `-1`
 * @example `calendarDaysBetween('2024-01-01T10:30', '2024-01-01T23:59')` -> `0`
 * @example `calendarDaysBetween('2024-01-01T23:59', '2024-01-02T00:01')` -> `1`
 */
export function calendarDaysBetween(
  start: ZonedDateTime | CalendarDateTime | CalendarDate,
  end: ZonedDateTime | CalendarDateTime | CalendarDate
): number {
  if (isSameDay(start, end)) {
    return 0;
  }

  const startZDT =
    start instanceof ZonedDateTime ? toTimeZone(start, "UTC") : toZoned(start, "UTC");
  const endZDT = end instanceof ZonedDateTime ? toTimeZone(end, "UTC") : toZoned(end, "UTC");

  const stMidnight = startZDT.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
  const endMidnight = endZDT.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

  const days = durationBetween(stMidnight, endMidnight).days;
  return start.compare(end) < 0 ? days : -days;
}

/**
 * Get the number of calendar months between two ZonedDateTime objects, in the calendar system of the start date.
 *
 * Note: For the Gregorian calendar, this will calculate the difference in months directly (since there are always 12 months in a year).
 *       For non-Gregorian calendars, this will loop through each year between the two dates and add the number of months in each year.
 *       This is because in some calendars, the number of months in a year can vary (e.g. in the Hebrew calendar, a leap year has 13 months).
 *
 * @param start Start date
 * @param end End date
 * @returns Number of calendar months between the two dates. If the start date is after the end date, the result will be negative.
 *
 * @example `calendarMonthsBetween('2024-01-01', '2023-12-31')` -> `-1`
 * @example `calendarMonthsBetween('2024-01-01', '2024-01-31')` -> `0`
 * @example `calendarMonthsBetween('2024-01-01', '2024-02-01')` -> `1`
 * @example `calendarMonthsBetween('2024-01-01', '2024-02-29')` -> `1`
 * @example `calendarMonthsBetween('2024-01-01', '2024-03-01')` -> `2`
 */
export function calendarMonthsBetween(
  start: ZonedDateTime | CalendarDateTime | CalendarDate,
  end: ZonedDateTime | CalendarDateTime | CalendarDate
): number {
  start = start.copy();
  end = toCalendar(end, start.calendar);

  if (isSameMonth(start, end)) {
    return 0;
  }

  if (start.compare(end) > 0) {
    return -calendarMonthsBetween(end, start);
  }

  if (start.calendar.identifier === "gregory") {
    return (end.year - start.year) * 12 + end.month - start.month;
  }

  let ans = 0;
  while (!isSameYear(start, end)) {
    const monthsInYear = start.calendar.getMonthsInYear(start);
    start = startOfYear(start.add({ years: 1 }));
    ans += monthsInYear;
  }

  return ans + end.month - start.month;
}

/**
 * Get the number of days in the month of a given date.
 * @param dt ZonedDateTime, CalendarDateTime, or CalendarDate object
 * @returns number of calendar days in the month of the given date
 *
 * @example `getDaysInMonth('2024-01-01')` -> `31`
 * @example `getDaysInMonth('2024-02-01')` -> `29`
 */
export function getDaysInMonth(dt: ZonedDateTime | CalendarDateTime | CalendarDate): number {
  return dt.calendar.getDaysInMonth(dt);
}

/**
 * Add `d` to `value`, wrapping around the range `[min, max]`.
 * @param value Value to add to
 * @param d Amount to add (can be negative)
 * @param min Minimum value (inclusive)
 * @param max Maximum value (inclusive)
 * @returns Result of adding `d` to `value`, wrapping around the range `[min, max]`
 */
export function cycle(value: number, d: number, min: number, max: number): number {
  const range = max - min + 1;
  const n = (value - min + d) % range;
  return n < 0 ? n + range : n + min;
}

/**
 * Get the earliest of two ZonedDateTime, CalendarDateTime, or CalendarDate objects.
 * @param a - First object
 * @param b - Second object
 * @returns - The earlier of the two datetimes
 */
export function dtMin(
  a: ZonedDateTime | CalendarDateTime | CalendarDate,
  b: ZonedDateTime | CalendarDateTime | CalendarDate
): ZonedDateTime | CalendarDateTime | CalendarDate {
  return a.compare(b) <= 0 ? a : b;
}
