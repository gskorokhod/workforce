import type { TimeDuration } from "@internationalized/date";
import type {
  DailyOptions,
  MonthlyOptions,
  RecurrenceOptions,
  SupportedFrequency,
  WeeklyOptions
} from "./options";

import {
  CalendarDate,
  fromDate,
  getLocalTimeZone,
  now,
  toCalendarDate,
  ZonedDateTime
} from "@internationalized/date";
import { RRule, RRuleSet } from "rrule";
import { HashMap } from "../utils";
import { toRecurrenceOptions } from "./options";
import { hasDate, localToUTC, toUTCDate } from "./utils";

/**
 * Properties for creating a Recurrence object.
 *
 * @property rRuleOptions RRule options. This field is required.
 * @property dtStart Start date of the recurrence pattern. Defaults to the current date & time in the local timezone.
 * @property duration Duration of the event. If null, the event is considered to last the entire day (i.e. from 00:00 to 23:59 on every date that matches the recurrence pattern).
 * @property dateOptions A map of dates to their status in the recurrence pattern. This can be used to explicitly include or exclude dates from the recurrence pattern.
 *
 * @see RecurrenceOptions
 * @see Recurrence
 */
interface RecurrenceProps {
  dtStart?: ZonedDateTime;
  duration?: TimeDuration | null;
  exceptions?: Map<CalendarDate, DateOption>;
  rRuleOptions: RecurrenceOptions;
}

/**
 * Represents the status of a date in a recurrence pattern.
 *
 * Possible values:
 * - `ALLOWED`: The date is not explicitly included or excluded from the recurrence pattern. The event may occur on this date if it matches the recurrence pattern. (This is the default state)
 * - `INCLUDED`: The date is explicitly included in the recurrence pattern. The event will always occur on this date, even if it does not match the recurrence pattern.
 * - `EXCLUDED`: The date is explicitly excluded from the recurrence pattern. The event will never occur on this date, even if it matches the recurrence pattern.
 */
enum DateOption {
  ALLOWED = "ALLOWED",
  EXCLUDED = "EXCLUDED",
  INCLUDED = "INCLUDED"
}

/**
 * Helper interface for the return value of the `Recurrence.probe` method.
 *
 * @property date Date & time that was probed.
 * @property status Whether the date is included, excluded, or allowed by the recurrence pattern.
 * @property matchesPattern Pattern Whether the date matches the recurrence pattern (ignoring explicit inclusions / exclusions).
 * @property occurrence If the event actually occurs at the given date & time, this field will contain the time slot during which the event occurs.
 *
 * @see Recurrence.probe
 * @see DateOption
 */
interface ProbeResult {
  date: ZonedDateTime;
  matchesPattern: boolean;
  occurrence?: TimeSlot;
  status: DateOption;
}

/**
 * Represents a time period during which an event occurs.
 */
class TimeSlot {
  /**
   * End date & time of the time slot.
   */
  readonly end: ZonedDateTime;
  /**
   * Start date & time of the time slot.
   */
  readonly start: ZonedDateTime;

  /**
   * Create a new time slot object.
   * @param start Start date & time of the time slot.
   * @param end End date & time of the time slot.
   */
  constructor(start: ZonedDateTime, end: ZonedDateTime) {
    this.start = start;
    this.end = end;
  }

  /**
   * Check if this time slot clashes with another time slot.
   * @param other time slot to check against
   * @returns True if the time slots clash, false otherwise
   */
  clashesWith(other: TimeSlot) {
    return this.start.compare(other.end) < 0 && this.end.compare(other.start) > 0;
  }

  /**
   * Get the time period during which this time slot clashes with another time slot.
   * @param other time slot to check against
   * @returns An time slot object representing the time period during which the time slots clash, or null if they do not clash
   */
  getClash(other: TimeSlot): TimeSlot | null {
    if (this.clashesWith(other)) {
      const start = this.start.compare(other.start) > 0 ? this.start : other.start;
      const end = this.end.compare(other.end) < 0 ? this.end : other.end;
      return new TimeSlot(start, end);
    }

    return null;
  }

  /**
   * Get the dates that this time slot spans.
   * @returns An Array of CalendarDate objects representing the dates that this time slot spans
   */
  getDates(): CalendarDate[] {
    let start = toCalendarDate(this.start);
    const end = toCalendarDate(this.end);

    const dates: CalendarDate[] = [start.copy()];

    while (start.compare(end) < 0) {
      start = start.add({ days: 1 });
      dates.push(start.copy());
    }

    return dates;
  }

  /**
   * Check if the event will be occurring at a given date & time.
   * @param zdt Date & time to check
   * @returns true if the event will be occurring at the given date & time, false otherwise
   */
  includes(zdt: ZonedDateTime) {
    return this.end.compare(zdt) >= 0 && this.start.compare(zdt) <= 0;
  }

  /**
   * Get the duration of the time slot.
   * @returns Duration of the time slot.
   */
  get duration(): TimeDuration {
    const millis = this.end.toDate().valueOf() - this.start.toDate().valueOf();
    return {
      hours: Math.floor(millis / (1000 * 60 * 60)),
      minutes: Math.floor((millis / (1000 * 60)) % 60),
      seconds: Math.floor((millis / 1000) % 60)
    };
  }
}
/**
 * Represents something that occurs at regular intervals and lasts for a certain duration.
 * (e.g. a shift that occurs every Monday from 9am to 5pm)
 */
class Recurrence {
  /**
   * The duration of the event.
   * If null, the event is considered to last the entire day (i.e. from 00:00 to 23:59 on every date that matches the recurrence pattern).
   */
  private _duration: TimeDuration | null = null;
  /**
   * Dates to exclude from the recurrence pattern.
   * These dates are always in UTC (i.e. there is no timezone offset).
   */
  private _exdates: Date[] = [];
  /**
   * Dates to include in the recurrence pattern.
   * These dates are always in UTC (i.e. there is no timezone offset).
   */
  private _rdates: Date[] = [];

  /**
   * The RRule object that defines the recurrence pattern.
   */
  private _rrule: RRule;

  /**
   * Create a new Recurrence object.
   * @param opts RRule options.
   * @see RecurrenceProps
   */
  constructor(props: RecurrenceProps) {
    // eslint-disable-next-line prefer-const
    let { dtstart, ...rest } = props.rRuleOptions;

    if (props.dtStart) {
      dtstart = toUTCDate(props.dtStart);
    } else {
      dtstart = props.rRuleOptions.dtstart
        ? localToUTC(props.rRuleOptions.dtstart)
        : toUTCDate(now(getLocalTimeZone()));
    }

    this._rrule = new RRule({ dtstart, ...rest });
    this._duration = props.duration || null;

    if (props.exceptions) {
      props.exceptions.forEach((option, date) => {
        if (option === DateOption.EXCLUDED) {
          this._exdates.push(toUTCDate(date));
        } else if (option === DateOption.INCLUDED) {
          this._rdates.push(toUTCDate(date));
        }
      });
    }
  }

  /**
   * Get the RRuleSet object representing the recurrence pattern with or without exceptions applied.
   * @returns The RRuleSet object representing the recurrence pattern.
   */
  private getRRuleSet(applyExceptions: boolean = true): RRuleSet {
    const rruleSet = new RRuleSet();

    rruleSet.rrule(this._rrule);

    if (applyExceptions) {
      this._rdates.forEach((d) => rruleSet.rdate(d));
      this._exdates.forEach((d) => rruleSet.exdate(d));
    }

    return rruleSet;
  }

  /**
   * Check if this recurrence clashes with another recurrence (within a given date range).
   * @param other Recurrence to check against
   * @param after Start date & time of the range to check, or null to start from the first occurrence. Defaults to null.
   * @param before End date & time of the range to check, or null to get all occurrences. Defaults to null.
   * @param limit Positive integer representing the number of occurrences to check. If `after` and `before` are both set, this defaults to infinity (i.e. all occurrences between the two dates will be checked). Otherwise, it defaults to 100.
   * @param applyExceptions If this is false, the date inclusion / exclusion functionality is disabled. Defaults to true.
   * @returns True if there are any clashes within the given period, false otherwise
   */
  clashesWith(
    other: Recurrence,
    after: ZonedDateTime | null = null,
    before: ZonedDateTime | null = null,
    limit: number = -1,
    applyExceptions: boolean = true
  ): boolean {
    const occ = this.getOccurrences(after, before, "UTC", true, limit, applyExceptions);
    const otherOcc = other.getOccurrences(after, before, "UTC", true, limit, applyExceptions);

    return occ.some((thisOcc) => otherOcc.some((otherOcc) => thisOcc.clashesWith(otherOcc)));
  }

  /**
   * Get all clashes between this recurrence and another recurrence (within a given date range).
   * @param other Recurrence to check against
   * @returns Array of `TimeSlot` objects representing the clashes
   */
  getClashes(
    other: Recurrence,
    after: ZonedDateTime | null = null,
    before: ZonedDateTime | null = null,
    limit: number = -1,
    applyExceptions: boolean = true
  ): TimeSlot[] {
    const occ = this.getOccurrences(after, before, "UTC", true, limit, applyExceptions);
    const otherOcc = other.getOccurrences(after, before, "UTC", true, limit, applyExceptions);

    const clashes: TimeSlot[] = [];

    occ.forEach((thisOcc) => {
      otherOcc.forEach((otherOcc) => {
        const clash = thisOcc.getClash(otherOcc);
        if (clash) clashes.push(clash);
      });
    });

    return clashes;
  }

  /**
   * Get the nth occurrence of the event in a given timezone.
   * If the event has fewer than n occurrences, null is returned.
   * By default, the first occurrence is returned `(n = 0)`. This can still be `null` if the event has no occurrences.
   * @param tzid ISO 8601 timezone ID to use for the occurrence. Defaults to the local timezone.
   * @param n Index of the occurrence to get. Defaults to 0.
   * @param applyExceptions If this is false, the date inclusion / exclusion functionality is disabled. Defaults to true.
   * @returns `TimeSlot` object representing the nth occurrence, or `null` if the event has fewer than n occurrences.
   * @see TimeSlot
   */
  getOccurrence(
    n: number = 0,
    tzid: string = getLocalTimeZone(),
    applyExceptions: boolean = true
  ): TimeSlot | null {
    const start = this.getStartDT(n, tzid, applyExceptions);
    if (start === null) return null;

    if (this._duration) {
      return new TimeSlot(start, start.add(this._duration));
    } else {
      return new TimeSlot(
        start.set({ hour: 0, minute: 0, second: 0 }),
        start.set({ hour: 23, minute: 59, second: 59 })
      );
    }
  }

  /**
   * Get all occurrences of the event between two dates, in a given timezone.
   * @param after Start date & time of the range, or null to start from the first occurrence. Defaults to null.
   * @param before End date & time of the range, or null to get all occurrences. Defaults to null.
   * @param tzid ISO 8601 timezone ID to use for the occurrences. Defaults to the local timezone.
   * @param inclusive If this is true, and the event occurs at the start or end dates, these occurrences will be included in the result. Defaults to true.
   * @param limit Positive integer representing the number of occurrences to return. If `after` and `before` are both set, this defaults to infinity (i.e. all occurrences between the two dates will be returned). Otherwise, it defaults to 100.
   * @param applyExceptions If this is false, the date inclusion / exclusion functionality is disabled. Defaults to true.
   * @returns Array of `TimeSlot` objects representing the occurrences
   * @see TimeSlot
   */
  getOccurrences(
    after: ZonedDateTime | null = null,
    before: ZonedDateTime | null = null,
    tzid: string = getLocalTimeZone(),
    inclusive: boolean = true,
    limit: number = -1,
    applyExceptions: boolean = true
  ): TimeSlot[] {
    const startTimes = this.getStartDTs(after, before, tzid, inclusive, limit, applyExceptions);

    return startTimes.map((sdt) => {
      if (this._duration) {
        return new TimeSlot(sdt, sdt.add(this._duration));
      } else {
        return new TimeSlot(
          sdt.set({ hour: 0, minute: 0, second: 0 }),
          sdt.set({ hour: 23, minute: 59, second: 59 })
        );
      }
    });
  }

  /**
   * Get the start time of the nth occurrence of the event in a given timezone.
   * If the event has fewer than n occurrences, null is returned.
   * By default, the first occurrence is returned `(n = 0)`. This can still be `null` if the event has no occurrences.
   * @param tzid ISO 8601 timezone ID to use for the start time. Defaults to the local timezone.
   * @param n Index of the occurrence to get. Defaults to 0. Negative values get occurrences from the end of the list, but for infinite patterns, this will always return null.
   * @param applyExceptions If this is false, the date inclusion / exclusion functionality is disabled. Defaults to true.
   * @returns `LocalDateTime` object representing the start time of the nth occurrence, or `null` if the event has fewer than n occurrences.
   */
  getStartDT(
    n: number = 0,
    tzid: string = getLocalTimeZone(),
    applyExceptions: boolean = true
  ): ZonedDateTime | null {
    if (n < 0) {
      if (!this.isFinite) return null;
      const dates = this.getRRuleSet(applyExceptions).all();
      const date = dates.at(n);
      return date ? fromDate(date, tzid) : null;
    }

    // Exceptionally included dates always come before the first occurrence.
    // Thank you for making my job harder, `rrule` authors :)
    const trueN = n + this._rdates.length;
    const dates = this.getRRuleSet(applyExceptions).all((_, i) => i <= trueN);
    if (dates.length <= n) return null;

    // Sort the dates to ensure the order is correct
    dates.sort((a, b) => a.valueOf() - b.valueOf());

    // Get the actual nth occurrence
    return fromDate(dates[n], tzid);
  }

  /**
   * Get the start and end of an occurrence of the event that would be happening at a given date & time.
   * @param date ZonedDateTime to check
   * @param tzid ISO 8601 timezone ID to use for the occurrence. Defaults to the local timezone.
   * @param applyExceptions If this is false, the date inclusion / exclusion functionality is disabled. Defaults to true.
   * @returns TimeSlot object representing the occurrence, or null if the event is not occurring at the given date & time.
   */
  getOccurrenceOn(
    date: ZonedDateTime,
    tzid: string = getLocalTimeZone(),
    applyExceptions: boolean = true
  ): TimeSlot | null {
    const occurrences = this.getOccurrences(
      date.subtract({ days: 1 }),
      date.add({ days: 1 }),
      tzid,
      true,
      Infinity,
      applyExceptions
    );

    return occurrences.find((occ) => occ.includes(date)) || null;
  }

  /**
   * Get the start times of all occurrences of the event between two dates, in a given timezone.
   * @param after Start date & time of the range, or null to start from the first occurrence. Defaults to null.
   * @param before End date & time of the range, or null to get all occurrences. Defaults to null.
   * @param tzid ISO 8601 timezone ID to use for the start times. Defaults to the local timezone.
   * @param inclusive If this is true, and the event occurs at the start or end dates, these occurrences will be included in the result. Defaults to true.
   * @param limit Positive integer representing the number of occurrences to return. If `after` and `before` are both set, this defaults to infinity (i.e. all occurrences between the two dates will be returned). Otherwise, it defaults to 100.
   * @param applyExceptions If this is false, the date inclusion / exclusion functionality is disabled. Defaults to true.
   *
   * @warning Recurrence may be infinite, so use the `limit` parameter to avoid infinite loops.
   * @warning This method may be slow for large recurrence patterns, especially on the first call.
   *
   * @returns Array of ZonedDateTime objects representing the start times of the occurrences.
   */
  getStartDTs(
    after: ZonedDateTime | null = null,
    before: ZonedDateTime | null = null,
    tzid: string = getLocalTimeZone(),
    inclusive: boolean = true,
    limit: number = -1,
    applyExceptions: boolean = true
  ): ZonedDateTime[] {
    const rruleSet = this.getRRuleSet(applyExceptions);
    let dates: Date[] = [];

    // Default limit to Infinity if both after and before are set, otherwise default to 100.
    // Note: the user can still set the limit explicitly to any positive integer.
    if (limit <= 0) limit = before !== null && after !== null ? Infinity : 100;

    if (after === null && before === null) {
      dates = rruleSet.all((_, i) => i < limit);
    } else if (after === null) {
      // Safe to cast because the case of both being null is handled above
      const beforeUTC = toUTCDate(before as ZonedDateTime);
      // Get all dates before the end date (respecting the `inclusive` parameter)
      dates = rruleSet.all(
        (date, i) => (inclusive ? date <= beforeUTC : date < beforeUTC) && i < limit
      );
    } else if (before === null) {
      // Safe to cast because the case of both being null is handled above
      const afterUTC = toUTCDate(after);
      // Get all dates after the start date (respecting the `inclusive` parameter)
      dates = rruleSet.all(
        (date, i) => (inclusive ? date >= afterUTC : date > afterUTC) && i < limit
      );
    } else {
      // Get all dates between the start and end dates (respecting the `inclusive` parameeter)
      dates = rruleSet.between(toUTCDate(after), toUTCDate(before), inclusive, (_, i) => i < limit);
    }

    // The sort is necessary because the order of dates is not guaranteed when using exclusion / inclusion dates
    dates.sort((a, b) => a.valueOf() - b.valueOf());
    return dates.map((d) => fromDate(d, tzid));
  }

  /**
   * Check if the event will be occurring at a given date & time.
   * @param zdt ZonedDateTime to check
   * @returns `ProbeResult` object - see `ProbeResult` for more information
   * @see ProbeResult
   */
  probe(zdt: ZonedDateTime): ProbeResult {
    const status = this.checkException(toCalendarDate(zdt));
    const matchesPattern = this.getOccurrenceOn(zdt, "UTC", false) !== null;
    const occurrence = this.getOccurrenceOn(zdt) || undefined;

    return { date: zdt, matchesPattern, occurrence, status };
  }

  /**
   * Check if a date is explicitly excluded from the recurrence pattern or included in it, or neither.
   * @param zdt ZonedDateTime to check
   * @returns `DateOption` representing the status of the date
   * @see DateOption
   */
  checkException(cd: CalendarDate): DateOption {
    const date = toUTCDate(cd);

    if (hasDate(date, this._rdates)) {
      return DateOption.INCLUDED;
    } else if (hasDate(date, this._exdates)) {
      return DateOption.EXCLUDED;
    } else {
      return DateOption.ALLOWED;
    }
  }

  /**
   * Remove a date from the list of exceptions.
   * @param cd CalendarDate to remove
   */
  removeException(cd: CalendarDate) {
    this.setException(cd, DateOption.ALLOWED);
  }

  /**
   * Set a date to be explicitly excluded from the recurrence pattern or included in it.
   * @param cd CalendarDate to set the status of
   * @param status Status to set
   * @see DateOption
   */
  setException(cd: CalendarDate, status: DateOption) {
    const date = toUTCDate(cd);

    switch (status) {
      case DateOption.ALLOWED:
        this._rdates = this._rdates.filter((d) => d.valueOf() !== date.valueOf());
        this._exdates = this._exdates.filter((d) => d.valueOf() !== date.valueOf());
        break;
      case DateOption.EXCLUDED:
        if (!hasDate(date, this._exdates)) {
          this._exdates.push(date);
        }
        this._rdates = this._rdates.filter((d) => d.valueOf() !== date.valueOf());
        break;
      case DateOption.INCLUDED:
        if (!hasDate(date, this._rdates)) {
          this._rdates.push(date);
        }
        this._exdates = this._exdates.filter((d) => d.valueOf() !== date.valueOf());
        break;
    }
  }

  /**
   * Get the dates that are explicitly included or excluded from the recurrence pattern.
   * @returns A map of CalendarDate objects (in UTC) to their status in the recurrence pattern.
   */
  getExceptions(): Map<CalendarDate, DateOption> {
    const equals = (a: CalendarDate, b: CalendarDate) => a.compare(b) === 0;
    const exceptions = new HashMap<CalendarDate, DateOption>(undefined, undefined, equals);

    this._rdates.forEach((d) => {
      exceptions.set(toCalendarDate(fromDate(d, "UTC")), DateOption.INCLUDED);
    });

    this._exdates.forEach((d) => {
      exceptions.set(toCalendarDate(fromDate(d, "UTC")), DateOption.EXCLUDED);
    });

    return exceptions;
  }

  /**
   * Set the duration of the event.
   *
   * @param duration The duration of the event. If null, the event is considered to last the entire day.
   * @warning No maximum duration is enforced, but we are assuming it is less than 24 hours. This may be changed in the future.
   *
   * TODO: Discuss if things can last more than 24 hours.
   */
  setDuration(duration: TimeDuration | null) {
    this._duration = duration;
  }

  /**
   * Set the start date of the recurrence pattern.
   * @param date ZonedDateTime object representing the start date of the recurrence pattern
   */
  setStartDT(date: ZonedDateTime) {
    this._rrule.options.dtstart = toUTCDate(date);
  }

  /**
   * Update the recurrence pattern options.
   * Fields that are not set in the new options will remain unchanged.
   * Explicitly setting a field to null will reset it to its default value.
   * The `freq` field is required and existing options that are incompatible with the new frequency will be removed.
   * @param options A `RecurrenceOptions` object representing the new options. Only the `freq` field is required.
   * @see RecurrenceOptions
   */
  updateOptions(options: RecurrenceOptions) {
    let opts: RecurrenceOptions;

    switch (options.freq) {
      case RRule.DAILY:
        opts = this._rrule.options as unknown as DailyOptions;
        break;
      case RRule.WEEKLY:
        opts = this._rrule.options as unknown as WeeklyOptions;
        break;
      case RRule.MONTHLY:
        opts = this._rrule.options as unknown as MonthlyOptions;
        break;
      default:
        throw new Error("Invalid frequency; must be one of DAILY, WEEKLY, or MONTHLY");
    }

    this._rrule = new RRule({ ...opts, ...options });
  }

  /**
   * Get the duration of the event.
   * @returns The duration of the event, or null if the event lasts the entire day.
   */
  get duration(): TimeDuration | null {
    return this._duration;
  }

  /**
   * Get the frequency of the recurrence pattern.
   */
  get frequency(): SupportedFrequency {
    // Safe to cast because unsupported frequencies are disallowed by the `RecurrenceOptions` type
    return this._rrule.options.freq as SupportedFrequency;
  }

  /**
   * Get the raw RRule options of the recurrence pattern.
   */
  get rawOptions() {
    return structuredClone(this._rrule.options);
  }

  /**
   * Get the options of the recurrence pattern.
   */
  get options(): RecurrenceOptions {
    // Safe to cast because the constructor takes a `RecurrenceOptions` object, so there can be no unsupported options
    return toRecurrenceOptions(this._rrule.options) as RecurrenceOptions;
  }

  /**
   * Check if the recurrence pattern is finite (i.e. has a count or until date).
   */
  get isFinite(): boolean {
    return this._rrule.options.count !== null || this._rrule.options.until !== null;
  }

  /**
   * Get the start date of the recurrence pattern in UTC.
   */
  get dtStart(): ZonedDateTime {
    const dtstart = this._rrule.options.dtstart;
    return fromDate(dtstart, "UTC");
  }
}

export { DateOption, Recurrence, TimeSlot, type RecurrenceOptions, type RecurrenceProps };
