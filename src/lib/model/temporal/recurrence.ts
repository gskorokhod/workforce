import type { CalendarDateTime, TimeDuration } from "@internationalized/date";
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
  parseZonedDateTime,
  toCalendarDate,
  toZoned,
  ZonedDateTime
} from "@internationalized/date";
import { RRule, RRuleSet } from "rrule";
import type { JsonObject } from "type-fest";
import { HashMap, type Copy } from "../utils";
import { toRecurrenceOptions } from "./options";
import {
  completeDuration,
  dtMax,
  dtMin,
  hasDate,
  localToUTC,
  parseDates,
  parseDateTimeDuration,
  toUTCDate
} from "./utils";

type Exceptions = Map<CalendarDate, DateOption> | { rdates?: Date[]; exdates?: Date[] };

/**
 * Properties for creating a Recurrence object.
 *
 * @property rrule RRule options. This field is required. It is recommended to use the `RecurrenceOptions` type for this field, but you can pass an RRule object directly if you need to.
 * @property dtStart Start date of the recurrence pattern. Defaults to the current date & time in the local timezone.
 * @property duration Duration of the event. If undefined, the event is considered to last the entire day (i.e. from 00:00 to 23:59 on every date that matches the recurrence pattern).
 * @property dateOptions A map of dates to their status in the recurrence pattern. This can be used to explicitly include or exclude dates from the recurrence pattern.
 *
 * @see RecurrenceOptions
 * @see Recurrence
 */
interface RecurrenceProps {
  dtstart?: ZonedDateTime;
  duration?: TimeDuration | undefined;
  exceptions?: Exceptions;
  rrule: RecurrenceOptions | RRule;
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
class TimeSlot implements Copy<TimeSlot> {
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
   * Get a time slot that spans the entire day of a given date.
   * @param date Date to get the time slot for. Can be an instance of `CalendarDate`, `CalendarDateTime`, or `ZonedDateTime`.
   * @param tzid For `CalendarDate` objects, the timezone ID to use. Defaults to the local timezone.
   * @returns TimeSlot object representing the entire day of the given date.
   */
  static allDay(date: CalendarDate | CalendarDateTime | ZonedDateTime, tzid?: string): TimeSlot {
    if (date instanceof ZonedDateTime) {
      return new TimeSlot(
        date.set({ hour: 0, minute: 0, second: 0 }),
        date.set({ hour: 23, minute: 59, second: 59 })
      );
    }
    const start = toZoned(date, tzid || getLocalTimeZone()).set({ hour: 0, minute: 0, second: 0 });
    const end = start.set({ hour: 23, minute: 59, second: 59 });
    return new TimeSlot(start, end);
  }

  /**
   * Create a deep copy of the time slot object.
   */
  copy(): TimeSlot {
    return new TimeSlot(this.start, this.end);
  }

  /**
   * Check if this time slot clashes with another time slot.
   * @param other time slot to check against
   * @returns True if the time slots clash, false otherwise
   */
  intersects(other: TimeSlot): boolean {
    return this.start.compare(other.end) < 0 && this.end.compare(other.start) > 0;
  }

  /**
   * Get the time period during which this time slot clashes with another time slot.
   * @param other time slot to check against
   * @returns An time slot object representing the time period during which the time slots clash, or undefined if they do not clash
   */
  intersect(other: TimeSlot): TimeSlot | undefined {
    if (this.intersects(other)) {
      const start = dtMax(this.start, other.start);
      const end = dtMin(this.end, other.end);
      return new TimeSlot(start, end);
    }

    return undefined;
  }

  /**
   * Get the parts of this time slot that are not covered by another time slot.
   * @param other Time slot to compare against
   * @returns Array of TimeSlot objects
   */
  except(other: TimeSlot): TimeSlot[] {
    const clash = this.intersect(other);
    if (!clash) return [this.copy()];

    const ans: TimeSlot[] = [];
    if (this.start.compare(clash.start) < 0) {
      ans.push(new TimeSlot(this.start, clash.start));
    }
    if (this.end.compare(clash.end) > 0) {
      ans.push(new TimeSlot(clash.end, this.end));
    }
    return ans;
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
   * Return a new TimeSlot object with the start and end times offset by a given duration.
   * @param by Duration by which to offset the time slot
   * @returns New TimeSlot object with the start and end times offset by the given duration
   */
  offset(by: TimeDuration): TimeSlot {
    return new TimeSlot(this.start.add(by), this.end.add(by));
  }

  /**
   * Serialize the time slot to a JSON object.
   * @returns The JSON object representing the time slot
   */
  toJSON(): JsonObject {
    return {
      start: this.start.toString(),
      end: this.end.toString()
    };
  }

  /**
   * Deserialize a JSON object to a TimeSlot object.
   * @param json JSON object to deserialize
   * @returns TimeSlot object, or undefined if the JSON object is invalid
   */
  static fromJSON(json: JsonObject): TimeSlot | undefined {
    if (typeof json.start !== "string" || typeof json.end !== "string") return undefined;

    try {
      const start = parseZonedDateTime(json.start);
      const end = parseZonedDateTime(json.end);
      return new TimeSlot(start, end);
    } catch {
      return undefined;
    }
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
class Recurrence implements Copy<Recurrence> {
  /**
   * The duration of the event.
   * If undefined, the event is considered to last the entire day (i.e. from 00:00 to 23:59 on every date that matches the recurrence pattern).
   */
  private _duration: TimeDuration | undefined = undefined;
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
   * @param props RRule options.
   * @see RecurrenceProps
   */
  constructor(props: RecurrenceProps) {
    this._rrule = this.initializeRRule(props);
    this._duration = props.duration;
    this.initializeExceptions(props.exceptions);
  }

  /**
   * Initialize the RRule object.
   * @param props Recurrence properties
   * @returns RRule object
   */
  private initializeRRule(props: RecurrenceProps): RRule {
    if (props.rrule instanceof RRule) {
      return props.rrule;
    } else {
      if (props.dtstart) {
        props.rrule.dtstart = toUTCDate(props.dtstart);
      }

      return new RRule({
        ...props.rrule,
        dtstart: props.rrule.dtstart || new Date()
      });
    }
  }

  /**
   * Initialize the exception dates.
   * @param exceptions Map of dates to their status in the recurrence pattern, or an object with `rdates` and `exdates` fields.
   * @returns void. This method modifies the object's `_rdates` and `_exdates` fields in place.
   */
  private initializeExceptions(exceptions?: Exceptions): void {
    if (!exceptions) return;

    if (exceptions instanceof Map || exceptions instanceof HashMap) {
      exceptions.forEach((status, date) => {
        this.setException(date, status);
      });
    } else {
      this._rdates = exceptions.rdates?.map(localToUTC) || [];
      this._exdates = exceptions.exdates?.map(localToUTC) || [];
    }
  }
  /**
   * Create a deep copy of the Recurrence object.
   */
  copy(): Recurrence {
    const rdates = this._rdates.map((d) => new Date(d.valueOf()));
    const exdates = this._exdates.map((d) => new Date(d.valueOf()));

    return new Recurrence({
      rrule: new RRule(this._rrule.options),
      duration: this._duration,
      exceptions: { rdates, exdates }
    });
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
   * Parse a JSON object to a Recurrence object.
   * @param json JSON object to parse
   * @returns new Recurrence object, or undefined if the JSON object is invalid
   */
  static fromJSON(json: JsonObject): Recurrence | undefined {
    if (typeof json.rrule !== "string") return undefined;

    try {
      const rrule: RRule = RRule.fromString(json.rrule);
      const rdates: Date[] = parseDates(json.rdates);
      const exdates: Date[] = parseDates(json.exdates);
      const duration: TimeDuration | undefined = parseDateTimeDuration(json.duration);

      return new Recurrence({
        rrule,
        duration,
        exceptions: { rdates, exdates }
      });
    } catch {
      return undefined;
    }
  }

  /**
   * Serialize the recurrence pattern to a JSON object.
   * @returns JSON object representing the recurrence pattern
   */
  toJSON(): JsonObject {
    const ans: JsonObject = {
      rrule: this._rrule.toString(),
      rdates: this._rdates.map((d) => d.toISOString()),
      exdates: this._exdates.map((d) => d.toISOString())
    };

    if (this._duration) {
      ans.duration = completeDuration(this._duration);
    }

    return ans;
  }

  /**
   * Check if this recurrence clashes with another recurrence (within a given date range).
   * @param other Recurrence to check against
   * @param after Start date & time of the range to check, or undefined to start from the first occurrence. Defaults to undefined.
   * @param before End date & time of the range to check, or undefined to get all occurrences. Defaults to undefined.
   * @param limit Positive integer representing the number of occurrences to check. If `after` and `before` are both set, this defaults to infinity (i.e. all occurrences between the two dates will be checked). Otherwise, it defaults to 100.
   * @param applyExceptions If this is false, the date inclusion / exclusion functionality is disabled. Defaults to true.
   * @returns True if there are any clashes within the given period, false otherwise
   */
  clashesWith(
    other: Recurrence,
    after: ZonedDateTime | undefined = undefined,
    before: ZonedDateTime | undefined = undefined,
    limit: number = -1,
    applyExceptions: boolean = true
  ): boolean {
    const occ = this.getOccurrences(after, before, "UTC", true, limit, applyExceptions);
    const otherOcc = other.getOccurrences(after, before, "UTC", true, limit, applyExceptions);

    return occ.some((thisOcc) => otherOcc.some((otherOcc) => thisOcc.intersects(otherOcc)));
  }

  /**
   * Get all clashes between this recurrence and another recurrence (within a given date range).
   * @param other Recurrence to check against
   * @returns Array of `TimeSlot` objects representing the clashes
   */
  getClashes(
    other: Recurrence,
    after: ZonedDateTime | undefined = undefined,
    before: ZonedDateTime | undefined = undefined,
    limit: number = -1,
    applyExceptions: boolean = true
  ): TimeSlot[] {
    const occ = this.getOccurrences(after, before, "UTC", true, limit, applyExceptions);
    const otherOcc = other.getOccurrences(after, before, "UTC", true, limit, applyExceptions);

    const clashes: TimeSlot[] = [];

    occ.forEach((thisOcc) => {
      otherOcc.forEach((otherOcc) => {
        const clash = thisOcc.intersect(otherOcc);
        if (clash) clashes.push(clash);
      });
    });

    return clashes;
  }

  /**
   * Get the nth occurrence of the event in a given timezone.
   * If the event has fewer than n occurrences, undefined is returned.
   * By default, the first occurrence is returned `(n = 0)`. This can still be `undefined` if the event has no occurrences.
   * @param tzid ISO 8601 timezone ID to use for the occurrence. Defaults to the local timezone.
   * @param n Index of the occurrence to get. Defaults to 0.
   * @param applyExceptions If this is false, the date inclusion / exclusion functionality is disabled. Defaults to true.
   * @returns `TimeSlot` object representing the nth occurrence, or `undefined` if the event has fewer than n occurrences.
   * @see TimeSlot
   */
  getOccurrence(
    n: number = 0,
    tzid: string = getLocalTimeZone(),
    applyExceptions: boolean = true
  ): TimeSlot | undefined {
    const start = this.getStartDT(n, tzid, applyExceptions);
    if (start === undefined) return undefined;

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
   * Get the start and end of an occurrence of the event that would be happening at a given date & time.
   * @param date ZonedDateTime to check
   * @param tzid ISO 8601 timezone ID to use for the occurrence. Defaults to the local timezone.
   * @param applyExceptions If this is false, the date inclusion / exclusion functionality is disabled. Defaults to true.
   * @returns TimeSlot object representing the occurrence, or undefined if the event is not occurring at the given date & time.
   */
  getOccurrenceOn(
    date: ZonedDateTime,
    tzid: string = getLocalTimeZone(),
    applyExceptions: boolean = true
  ): TimeSlot | undefined {
    const occurrences = this.getOccurrences(
      date.subtract({ days: 1 }),
      date.add({ days: 1 }),
      tzid,
      true,
      Infinity,
      applyExceptions
    );

    return occurrences.find((occ) => occ.includes(date)) || undefined;
  }

  /**
   * Get all occurrences of the event between two dates, in a given timezone.
   * @param after Start date & time of the range, or undefined to start from the first occurrence. Defaults to undefined.
   * @param before End date & time of the range, or undefined to get all occurrences. Defaults to undefined.
   * @param tzid ISO 8601 timezone ID to use for the occurrences. Defaults to the local timezone.
   * @param inclusive If this is true, and the event occurs at the start or end dates, these occurrences will be included in the result. Defaults to true.
   * @param limit Positive integer representing the number of occurrences to return. If `after` and `before` are both set, this defaults to infinity (i.e. all occurrences between the two dates will be returned). Otherwise, it defaults to 100.
   * @param applyExceptions If this is false, the date inclusion / exclusion functionality is disabled. Defaults to true.
   * @returns Array of `TimeSlot` objects representing the occurrences
   * @see TimeSlot
   */
  getOccurrences(
    after: ZonedDateTime | undefined = undefined,
    before: ZonedDateTime | undefined = undefined,
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
   * If the event has fewer than n occurrences, undefined is returned.
   * By default, the first occurrence is returned `(n = 0)`. This can still be `undefined` if the event has no occurrences.
   * @param tzid ISO 8601 timezone ID to use for the start time. Defaults to the local timezone.
   * @param n Index of the occurrence to get. Defaults to 0. Negative values get occurrences from the end of the list, but for infinite patterns, this will always return undefined.
   * @param applyExceptions If this is false, the date inclusion / exclusion functionality is disabled. Defaults to true.
   * @returns `LocalDateTime` object representing the start time of the nth occurrence, or `undefined` if the event has fewer than n occurrences.
   */
  getStartDT(
    n: number = 0,
    tzid: string = getLocalTimeZone(),
    applyExceptions: boolean = true
  ): ZonedDateTime | undefined {
    if (n < 0) {
      if (!this.isFinite) return undefined;
      const dates = this.getRRuleSet(applyExceptions).all();
      const date = dates.at(n);
      return date ? fromDate(date, tzid) : undefined;
    }

    // Exceptionally included dates always come before the first occurrence.
    // Thank you for making my job harder, `rrule` authors :)
    const trueN = n + this._rdates.length;
    const dates = this.getRRuleSet(applyExceptions).all((_, i) => i <= trueN);
    if (dates.length <= n) return undefined;

    // Sort the dates to ensure the order is correct
    dates.sort((a, b) => a.valueOf() - b.valueOf());

    // Get the actual nth occurrence
    return fromDate(dates[n], tzid);
  }

  /**
   * Get the start times of all occurrences of the event between two dates, in a given timezone.
   * @param after Start date & time of the range, or undefined to start from the first occurrence. Defaults to undefined.
   * @param before End date & time of the range, or undefined to get all occurrences. Defaults to undefined.
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
    after: ZonedDateTime | undefined = undefined,
    before: ZonedDateTime | undefined = undefined,
    tzid: string = getLocalTimeZone(),
    inclusive: boolean = true,
    limit: number = -1,
    applyExceptions: boolean = true
  ): ZonedDateTime[] {
    const rruleSet = this.getRRuleSet(applyExceptions);
    let dates: Date[] = [];

    // Default limit to Infinity if both after and before are set, otherwise default to 100.
    // Note: the user can still set the limit explicitly to any positive integer.
    if (limit <= 0) limit = before !== undefined && after !== undefined ? Infinity : 100;

    if (after === undefined && before === undefined) {
      dates = rruleSet.all((_, i) => i < limit);
    } else if (after === undefined) {
      // Safe to cast because the case of both being undefined is handled above
      const beforeUTC = toUTCDate(before as ZonedDateTime);
      // Get all dates before the end date (respecting the `inclusive` parameter)
      dates = rruleSet.all(
        (date, i) => (inclusive ? date <= beforeUTC : date < beforeUTC) && i < limit
      );
    } else if (before === undefined) {
      // Safe to cast because the case of both being undefined is handled above
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
    const matchesPattern = this.getOccurrenceOn(zdt, "UTC", false) !== undefined;
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
   * @param duration The duration of the event. If undefined, the event is considered to last the entire day.
   * @warning No maximum duration is enforced, but we are assuming it is less than 24 hours. This may be changed in the future.
   *
   * TODO: Discuss if things can last more than 24 hours.
   */
  setDuration(duration: TimeDuration | undefined) {
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
   * Explicitly setting a field to undefined will reset it to its default value.
   * The `freq` field is required and existing options that are incompatible with the new frequency will be removed.
   * @param options A `RecurrenceOptions` object representing the new options. Only the `freq` field is required.
   * @see RecurrenceOptions
   */
  setOptions(options: RecurrenceOptions) {
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
   * Create a new Recurrence object with updated properties.
   * @param props Partial properties to update
   * @returns New Recurrence object with the updated properties
   */
  update(props: Partial<RecurrenceProps>): Recurrence {
    return new Recurrence({
      dtstart: props.dtstart || this.dtStart,
      duration: props.duration || this._duration,
      exceptions: props.exceptions || { rdates: this._rdates, exdates: this._exdates },
      rrule: props.rrule || this._rrule
    });
  }

  /**
   * Get the duration of the event.
   * @returns The duration of the event, or undefined if the event lasts the entire day.
   */
  get duration(): TimeDuration | undefined {
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
  get recurrenceOptions(): RecurrenceOptions {
    // Safe to cast because the constructor takes a `RecurrenceOptions` object, so there can be no unsupported options
    return toRecurrenceOptions(this._rrule.options) as RecurrenceOptions;
  }

  /**
   * Get the properties of the Recurrence object.
   */
  get props(): RecurrenceProps {
    return {
      dtstart: this.dtStart,
      duration: this._duration,
      exceptions: this.getExceptions(),
      rrule: this.recurrenceOptions
    };
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
