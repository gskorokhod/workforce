import { noUndefined } from "$lib/utils/misc";
import {
  CalendarDate,
  CalendarDateTime,
  isSameDay,
  isSameMonth,
  isSameYear,
  parseDate,
  startOfYear,
  Time,
  toCalendar,
  toCalendarDate,
  toTimeZone,
  toZoned,
  ZonedDateTime,
  type DateTimeDuration,
  type DateValue,
  type TimeDuration,
} from "@internationalized/date";

import { datetime } from "rrule";
import type { JsonObject, JsonValue } from "type-fest";

/**
 * Converts a ZonedDateTime or CalendarDate to a Date object in UTC.
 * @param zdt ZonedDateTime or CalendarDate to convert
 * @returns Date object in UTC
 */
export function toUTCDate(dt: DateValue): Date {
  if (dt instanceof CalendarDate) {
    return datetime(dt.year, dt.month, dt.day);
  }

  const d = dt instanceof ZonedDateTime ? toTimeZone(dt, "UTC") : toZoned(dt, "UTC");
  return datetime(d.year, d.month, d.day, d.hour, d.minute, d.second);
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
    d.getUTCSeconds(),
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
export function dtDurationBetween(a: DateValue, b: DateValue) {
  const aDate = a instanceof ZonedDateTime ? a.toDate() : a.toDate("UTC");
  const bDate = b instanceof ZonedDateTime ? b.toDate() : b.toDate("UTC");
  const totalMillis = Math.abs(aDate.valueOf() - bDate.valueOf());

  const [totalSeconds, millis] = divMod(totalMillis, 1000);
  const [totalMinutes, seconds] = divMod(totalSeconds, 60);
  const [totalHours, minutes] = divMod(totalMinutes, 60);
  const [days, hours] = divMod(totalHours, 24);

  return {
    days,
    hours,
    minutes,
    seconds,
    milliseconds: millis,
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
export function calendarDaysBetween(start: DateValue, end: DateValue): number {
  if (isSameDay(start, end)) {
    return 0;
  }

  const startZDT =
    start instanceof ZonedDateTime ? toTimeZone(start, "UTC") : toZoned(start, "UTC");
  const endZDT = end instanceof ZonedDateTime ? toTimeZone(end, "UTC") : toZoned(end, "UTC");

  const stMidnight = startZDT.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
  const endMidnight = endZDT.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

  const days = dtDurationBetween(stMidnight, endMidnight).days;
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
export function calendarMonthsBetween(start: DateValue, end: DateValue): number {
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
export function getDaysInMonth(dt: DateValue): number {
  return dt.calendar.getDaysInMonth(dt);
}

/**
 * Get the number of full years between two ZonedDateTime objects, in the calendar system of the start date.
 * @param start Start date
 * @param end End date
 * @returns Number of full years between the two dates. If the start date is after the end date, the result will be negative.
 * @example `fullYearsBetween('2024-01-01', '2023-12-31')` -> `0`
 * @example `fullYearsBetween('2024-01-01', '2024-12-31')` -> `0`
 * @example `fullYearsBetween('2024-01-01', '2025-01-01')` -> `1`
 */
export function fullYearsBetween(start: DateValue, end: DateValue): number {
  start = start.copy();
  end = toCalendar(end, start.calendar);

  if (isSameYear(start, end)) {
    return 0;
  }

  if (start.compare(end) > 0) {
    return -fullYearsBetween(end, start);
  }

  const years = end.year - start.year;
  const startNext = start.add({ years: years });

  if (end.compare(startNext) < 0) {
    return years - 1;
  } else {
    return years;
  }
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
 * Get the latest of two ZonedDateTime, CalendarDateTime, or CalendarDate objects.
 * @param a First object
 * @param b Second object
 * @returns The later of the two datetimes
 */
export function dtMax<T extends DateValue | Time>(a: T, b: T): T {
  if (a instanceof Time && b instanceof Time) {
    return a.compare(b) >= 0 ? a : b;
  } else if (!(a instanceof Time) && !(b instanceof Time)) {
    return a.compare(b) >= 0 ? a : b;
  }
  throw new Error("Cannot mix Time and ZonedDateTime objects");
}

/**
 * Get the earliest of two ZonedDateTime, CalendarDateTime, or CalendarDate objects.
 * @param a First object
 * @param b Second object
 * @returns The earlier of the two datetimes
 */
export function dtMin<T extends DateValue | Time>(a: T, b: T): T {
  if (a instanceof Time && b instanceof Time) {
    return a.compare(b) <= 0 ? a : b;
  } else if (!(a instanceof Time) && !(b instanceof Time)) {
    return a.compare(b) <= 0 ? a : b;
  }
  throw new Error("Cannot mix Time and ZonedDateTime objects");
}

/**
 * Convert a TimeDuration object to milliseconds.
 * @param dur TimeDuration object
 * @returns number of milliseconds
 */
export function toMillis(dur: TimeDuration | Time): number {
  if (dur instanceof Time) {
    return dur.hour * 60 * 60 * 1000 + dur.minute * 60 * 1000 + dur.second * 1000 + dur.millisecond;
  }
  const d = completeDuration(dur);
  return d.milliseconds + d.seconds * 1000 + d.minutes * 60 * 1000 + d.hours * 60 * 60 * 1000;
}

/**
 * Convert a TimeDuration object to minutes.
 * @param dur TimeDuration object
 * @returns number of minutes
 */
export function toMinutes(dur: TimeDuration | Time): number {
  return toMillis(dur) / 60000;
}

/**
 * Get the duration between two Time objects or two DateValue objects.
 * @param a Start date or time
 * @param b End date or time
 * @returns TimeDuration object representing the absolute duration between the two dates or times
 */
export function timeDurationBetween<T extends DateValue | Time>(a: T, b: T): TimeDuration {
  if (a instanceof Time && b instanceof Time) {
    const mins = Math.abs(toMinutes(b as Time) - toMinutes(a as Time));
    const [hours, minutes] = divMod(mins, 60);
    return { hours, minutes, seconds: 0, milliseconds: 0 };
  }
  if (!(a instanceof Time) && !(b instanceof Time)) {
    const dtd = dtDurationBetween(a, b);
    return {
      hours: Math.abs(dtd.days * 24 + dtd.hours),
      minutes: Math.abs(dtd.minutes),
      seconds: Math.abs(dtd.seconds),
      milliseconds: Math.abs(dtd.milliseconds),
    };
  }
  throw new Error("Cannot mix Time and ZonedDateTime objects");
}

/**
 * Get the number of minutes between two Time objects or two DateValue objects.
 * @param a Start date or time
 * @param b End date or time
 * @returns Absolute number of minutes between the two dates or times
 */
export function minutesBetween<T extends DateValue | Time>(a: T, b: T): number {
  return toMinutes(timeDurationBetween(a, b));
}

/**
 * Convert a number of minutes to a Time object.
 * @param minutes number of minutes
 * @returns Time object
 */
export function timeFromMinutes(minutes: number): Time {
  const [hours, mins] = divMod(minutes, 60);
  return new Time(hours, mins);
}

type WithTime = ZonedDateTime | CalendarDateTime | Time | Date | TimeDuration;

/**
 * Extract the time component from a ZonedDateTime, CalendarDateTime, Time, Date, or TimeDuration object.
 * @param time Object to extract time from
 * @returns Time object
 */
export function timeComponent(time: WithTime | undefined | null): Time {
  if (!time) {
    return new Time(0, 0);
  }
  if (time instanceof Time) {
    return time;
  }
  if (time instanceof Date) {
    return new Time(time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds());
  }
  if (time instanceof ZonedDateTime || time instanceof CalendarDateTime) {
    return new Time(time.hour, time.minute, time.second, time.millisecond);
  }
  return new Time(time.hours, time.minutes, time.seconds, time.milliseconds);
}

/**
 * Format a Time object as a string.
 * @param time Time object to format
 * @param options Intl.DateTimeFormatOptions overrides
 * @param locale Locale to use. Defaults to the user's preferred languages, or "en" as a fallback.
 * @returns Formatted time string
 */
export function fmtTime(
  time: WithTime | undefined | null,
  options: Intl.DateTimeFormatOptions = {},
  locale = navigator.languages || "en",
): string {
  const tc = timeComponent(time);
  const dt = new Date();
  dt.setHours(tc.hour);
  dt.setMinutes(tc.minute);

  return dt.toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "numeric",
    ...options,
  });
}

/**
 * Convert milliseconds to a TimeDuration object.
 * @param ms Milliseconds
 * @returns TimeDuration object
 */
export function fromMillis(ms: number): TimeDuration {
  const [secondsCarry, milliseconds] = divMod(ms, 1000);
  const [minutesCarry, seconds] = divMod(secondsCarry, 60);
  const [hours, minutes] = divMod(minutesCarry, 60);
  return {
    hours,
    minutes,
    seconds,
    milliseconds,
  };
}

/**
 * Compare two TimeDuration objects.
 * @param a TimeDuration object
 * @param b TimeDuration object
 * @returns Negative if `a` is less than `b`, positive if `a` is greater than `b`, and 0 if they are equal
 */
export function cmpTime(a: TimeDuration | Time, b: TimeDuration | Time): number {
  return toMillis(a) - toMillis(b);
}

/**
 * Add two TimeDuration objects together.
 * @param a TimeDuration object
 * @param b TimeDuration object
 * @returns TimeDuration object representing the sum of `a` and `b`
 */
export function addTime(a: TimeDuration | Time, b: TimeDuration | Time): TimeDuration {
  return fromMillis(toMillis(a) + toMillis(b));
}

/**
 * Get the absolute difference between two TimeDuration objects.
 * @param a TimeDuration object
 * @param b TimeDuration object
 * @returns TimeDuration object representing the absolute difference between `a` and `b`
 */
export function diffTime(a: TimeDuration | Time, b: TimeDuration | Time): TimeDuration {
  return fromMillis(Math.abs(toMillis(a) - toMillis(b)));
}

/**
 * Return the latest of two Time objects or the longest of two TimeDuration objects.
 */
export function tMax(a: TimeDuration | Time, b: TimeDuration | Time): TimeDuration | Time {
  return cmpTime(a, b) >= 0 ? a : b;
}

/**
 * Return the earliest of two Time objects or the shortest of two TimeDuration objects.
 */
export function tMin(a: TimeDuration | Time, b: TimeDuration | Time): TimeDuration | Time {
  return cmpTime(a, b) <= 0 ? a : b;
}

/**
 * Fill missing fields in a DateTimeDuration object with default values.
 * @param dur Partial DateTimeDuration object
 * @returns DateTimeDuration object with all fields filled
 */
export function completeDuration(dur: Partial<DateTimeDuration>): Required<DateTimeDuration> {
  return {
    years: dur.years ?? 0,
    months: dur.months ?? 0,
    days: dur.days ?? 0,
    weeks: dur.weeks ?? 0,
    hours: dur.hours ?? 0,
    minutes: dur.minutes ?? 0,
    seconds: dur.seconds ?? 0,
    milliseconds: dur.milliseconds ?? 0,
  };
}

/**
 * Parse a DateTimeDuration object from a JSON object.
 * @param json JSON object to parse
 * @returns DateTimeDuration object, or undefined if the JSON object is invalid
 */
export function parseDateTimeDuration(json: JsonValue): DateTimeDuration | undefined {
  if (typeof json !== "object" || !json) {
    return undefined;
  }

  const jsn = json as JsonObject;
  const ans = {
    years: tryParseInt(jsn.years),
    months: tryParseInt(jsn.months),
    days: tryParseInt(jsn.days),
    weeks: tryParseInt(jsn.weeks),
    hours: tryParseInt(jsn.hours),
    minutes: tryParseInt(jsn.minutes),
    seconds: tryParseInt(jsn.seconds),
    milliseconds: tryParseInt(jsn.milliseconds),
  };
  return noUndefined(ans);
}

/**
 * Try to parse an array of dates from a JSON value.
 * @param json JSON value to parse
 * @returns Array of dates
 */
export function parseDates(json: JsonValue): CalendarDate[] {
  if (!Array.isArray(json)) {
    return [];
  }

  const dates: CalendarDate[] = [];
  for (const item of json) {
    if (typeof item === "string") {
      dates.push(parseDate(item));
    }
  }
  return dates;
}

/**
 * Parse an integer from a JSON value, if possible.
 * @param value JSON value to parse
 * @returns number, or undefined if the value is not a number or a string that can be parsed as a number
 */
export function tryParseInt(value: unknown): number | undefined {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      return num;
    }
  }

  return undefined;
}

/**
 * Get a list of all days between two dates.
 * @param start Range start (inclusive)
 * @param end Range end (inclusive)
 * @returns Array of CalendarDate objects
 */
export function allDaysBetween(start: DateValue, end: DateValue): CalendarDate[] {
  const dates: CalendarDate[] = [];
  let current = start.copy();
  while (current.compare(end) <= 0) {
    dates.push(toCalendarDate(current));
    current = current.add({ days: 1 });
  }
  return dates;
}

interface Event {
  start: Time;
  end: Time;
}

/**
 * Get the overlap between two events.
 * @param a Event with start and end times
 * @param b Event with start and end times
 * @returns Overlapping time period, or undefined if the events do not overlap
 */
export function getClash(a: Event, b: Event): Event | null {
  const start = tMax(a.start, b.start) as Time;
  const end = tMin(a.end, b.end) as Time;

  if (cmpTime(start, end) >= 0) {
    return null;
  }

  return { start, end };
}
