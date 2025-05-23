import { type Copy } from "$lib/utils";
import { noUndefined } from "$lib/utils/misc";
import {
  CalendarDate,
  fromDate,
  getLocalTimeZone,
  Time,
  toCalendarDateTime,
  toZoned,
  ZonedDateTime,
  type DateValue,
  type TimeDuration,
} from "@internationalized/date";
import { Frequency, RRule, RRuleSet } from "rrule";
import type { JsonObject, JsonValue } from "type-fest";
import { fromRecurrenceOptions, toRecurrenceOptions, type RecurrenceOptions } from "./options";
import { TimeSlot } from "./timeslot";
import {
  cdSchema,
  formattedDuration,
  timeDurationBetween,
  timeDurationSchema,
  toUTCDate,
} from "./utils";
import { z } from "zod";

interface RecurrenceProps {
  rule: Partial<RecurrenceOptions> | RRule;
  tzid?: string;
  duration?: TimeDuration;
  rdates?: CalendarDate[];
  exdates?: CalendarDate[];
}

/**
 * Represents something that occurs at regular intervals and lasts for a certain duration.
 * (e.g. a shift that occurs every Monday from 9am to 5pm)
 */
class Recurrence implements Copy<Recurrence> {
  static schema = z.object({
    tzid: z.string().default(getLocalTimeZone),
    rule: z.string().transform(RRule.fromString),
    duration: timeDurationSchema.optional(),
    rdates: z.array(cdSchema).optional(),
    exdates: z.array(cdSchema).optional(),
  });

  tzid: string = getLocalTimeZone();
  /**
   * The duration of the event.
   * If undefined, the event is considered to last the entire day (i.e. from 00:00 to 23:59 on every date that matches the recurrence pattern).
   */
  duration: TimeDuration | undefined = undefined;
  /**
   * Dates to exclude from the recurrence pattern.
   * These dates are always in UTC (i.e. there is no timezone offset).
   */
  exdates: CalendarDate[] = [];
  /**
   * Dates to include in the recurrence pattern.
   * These dates are always in UTC (i.e. there is no timezone offset).
   */
  rdates: CalendarDate[] = [];

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
    this.duration = props.duration;
    this.tzid = props.tzid || getLocalTimeZone();
    this.rdates = props.rdates || [];
    this.exdates = props.exdates || [];
  }

  /**
   * Initialize the RRule object.
   * @param props Recurrence properties
   * @returns RRule object
   */
  private initializeRRule(props: RecurrenceProps): RRule {
    if (props.rule instanceof RRule) {
      return props.rule;
    } else {
      const options = fromRecurrenceOptions(props.rule);
      return new RRule(options);
    }
  }

  /**
   * Create a deep copy of the Recurrence object.
   */
  copy(): Recurrence {
    return new Recurrence({
      rule: this._rrule.clone(),
      duration: this.duration,
      rdates: this.rdates.map((d) => d.copy()),
      exdates: this.exdates.map((d) => d.copy()),
    });
  }

  /**
   * Get the RRuleSet object representing the recurrence pattern with or without exceptions applied.
   * @returns The RRuleSet object representing the recurrence pattern.
   */
  private getRRuleSet(applyExceptions = true): RRuleSet {
    const rruleSet = new RRuleSet();

    rruleSet.rrule(this._rrule);
    if (applyExceptions) {
      this.rdates.forEach((d) => rruleSet.rdate(toUTCDate(d)));
      this.exdates.forEach((d) => rruleSet.exdate(toUTCDate(d)));
    }

    return rruleSet;
  }

  static daily(props: {
    startDate: CalendarDate;
    endDate?: CalendarDate;
    times?: number;
    start?: Time;
    end?: Time;
    tzid?: string;
  }) {
    const tzid = props.tzid || getLocalTimeZone();
    const dtstart = toZoned(toCalendarDateTime(props.startDate, props.start), tzid);
    const duration =
      props.start && props.end ? timeDurationBetween(props.start, props.end) : undefined;
    if (props.endDate) {
      return new Recurrence({
        tzid,
        rule: {
          freq: Frequency.DAILY,
          dtstart,
          until: toZoned(toCalendarDateTime(props.endDate, props.end), tzid),
        },
        duration,
      });
    } else {
      return new Recurrence({
        tzid,
        rule: {
          freq: Frequency.DAILY,
          dtstart,
          count: props.times,
        },
        duration,
      });
    }
  }

  /**
   * Parse a JSON object to a Recurrence object.
   * @param json JSON object to parse
   * @returns new Recurrence object, or undefined if the JSON object is invalid
   */
  static fromJSON(json: JsonValue): Recurrence {
    const parsed = Recurrence.schema.parse(json);
    return new Recurrence(parsed);
  }

  /**
   * Serialize the recurrence pattern to a JSON object.
   * @returns JSON object representing the recurrence pattern
   */
  toJSON(): JsonObject {
    const ans: JsonObject = {
      tzid: this.tzid,
      rule: this._rrule.toString(),
      rdates: this.rdates.map((d) => d.toString()),
      exdates: this.exdates.map((d) => d.toString()),
    };

    if (this.duration) {
      ans.duration = Object.fromEntries(
        Object.entries(this.duration).filter(([_, v]) => v !== undefined),
      );
    }

    return ans;
  }

  /**
   * Get all clashes between this recurrence and another recurrence (within a given date range).
   * @param other Recurrence to check against
   * @returns Array of `TimeSlot` objects representing the clashes
   */
  clashes(
    other: Recurrence,
    after: ZonedDateTime | undefined = undefined,
    before: ZonedDateTime | undefined = undefined,
    limit = -1,
    applyExceptions = true,
  ): TimeSlot[] {
    const occ = this.occurrences(after, before, true, limit, applyExceptions);
    const otherOcc = other.occurrences(after, before, true, limit, applyExceptions);

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
  occurrence(n = 0, applyExceptions = true): TimeSlot | undefined {
    const start = this.getStartDT(n, applyExceptions);
    if (start === undefined) return undefined;

    if (this.duration) {
      return new TimeSlot(start, start.add(this.duration));
    } else {
      return new TimeSlot(
        start.set({ hour: 0, minute: 0, second: 0 }),
        start.set({ hour: 23, minute: 59, second: 59 }),
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
  occurrencesOn(date: DateValue, applyExceptions = true): TimeSlot[] {
    const allDay = TimeSlot.allDay(date);
    const occurrences = this.occurrences(
      date.subtract({ days: 1 }),
      date.add({ days: 1 }),
      true,
      Infinity,
      applyExceptions,
    );

    return occurrences.filter((occ) => occ.intersects(allDay));
  }

  /**
   * Get all occurrences of the event between two dates, in a given timezone.
   * @param after Start date & time of the range, or undefined to start from the first occurrence. Defaults to undefined.
   * @param before End date & time of the range, or undefined to get all occurrences. Defaults to undefined.
   * @param inclusive If this is true, and the event occurs at the start or end dates, these occurrences will be included in the result. Defaults to true.
   * @param limit Positive integer representing the number of occurrences to return. If `after` and `before` are both set, this defaults to infinity (i.e. all occurrences between the two dates will be returned). Otherwise, it defaults to 100.
   * @param applyExceptions If this is false, the date inclusion / exclusion functionality is disabled. Defaults to true.
   * @returns Array of `TimeSlot` objects representing the occurrences
   * @see TimeSlot
   */
  occurrences(
    after: DateValue | undefined = undefined,
    before: DateValue | undefined = undefined,
    inclusive = true,
    limit = -1,
    applyExceptions = true,
  ): TimeSlot[] {
    const startTimes = this.getStartDTs(after, before, inclusive, limit, applyExceptions);

    return startTimes.map((sdt) => {
      if (this.duration) {
        return new TimeSlot(sdt, sdt.add(this.duration));
      } else {
        return new TimeSlot(
          sdt.set({ hour: 0, minute: 0, second: 0 }),
          sdt.set({ hour: 23, minute: 59, second: 59 }),
        );
      }
    });
  }

  /**
   * Get the start time of the nth occurrence of the event in a given timezone.
   * If the event has fewer than n occurrences, undefined is returned.
   * By default, the first occurrence is returned `(n = 0)`. This can still be `undefined` if the event has no occurrences.
   * @param n Index of the occurrence to get. Defaults to 0. Negative values get occurrences from the end of the list, but for infinite patterns, this will always return undefined.
   * @param applyExceptions If this is false, the date inclusion / exclusion functionality is disabled. Defaults to true.
   * @returns `LocalDateTime` object representing the start time of the nth occurrence, or `undefined` if the event has fewer than n occurrences.
   */
  private getStartDT(n = 0, applyExceptions = true): ZonedDateTime | undefined {
    let dates: Date[] = [];

    if (n < 0) {
      if (!this.isFinite) return undefined;
      dates = this.getRRuleSet(applyExceptions).all();
    } else {
      dates = this.getRRuleSet(applyExceptions).all((_, i) => i <= n + this.rdates.length);
    }

    if (dates.length <= Math.abs(n)) return undefined;

    dates.sort((a, b) => a.valueOf() - b.valueOf());
    return fromDate(dates[n], this.tzid);
  }

  /**
   * Get the start times of all occurrences of the event between two dates, in a given timezone.
   * @param after Start date & time of the range, or undefined to start from the first occurrence. Defaults to undefined.
   * @param before End date & time of the range, or undefined to get all occurrences. Defaults to undefined.
   * @param inclusive If this is true, and the event occurs at the start or end dates, these occurrences will be included in the result. Defaults to true.
   * @param limit Positive integer representing the number of occurrences to return. If `after` and `before` are both set, this defaults to infinity (i.e. all occurrences between the two dates will be returned). Otherwise, it defaults to 100.
   * @param applyExceptions If this is false, the date inclusion / exclusion functionality is disabled. Defaults to true.
   *
   * @warning Recurrence may be infinite, so use the `limit` parameter to avoid infinite loops.
   * @warning This method may be slow for large recurrence patterns, especially on the first call.
   *
   * @returns Array of ZonedDateTime objects representing the start times of the occurrences.
   */
  private getStartDTs(
    after: DateValue | undefined = undefined,
    before: DateValue | undefined = undefined,
    inclusive = true,
    limit = -1,
    applyExceptions = true,
  ): ZonedDateTime[] {
    const rruleSet = this.getRRuleSet(applyExceptions);
    let dates: Date[] = [];

    // Default limit to Infinity if both after and before are set, otherwise default to 100.
    // Note: the user can still set the limit explicitly to any positive integer.
    if (limit <= 0) limit = before !== undefined && after !== undefined ? Infinity : 100;

    if (after === undefined && before === undefined) {
      // Neither of the constraints
      dates = rruleSet.all((_, i) => i < limit);
    } else if (after === undefined && before) {
      // Only the "before" constraint
      const beforeUTC = toUTCDate(before);
      dates = rruleSet.all(
        (date, i) => (inclusive ? date <= beforeUTC : date < beforeUTC) && i < limit,
      );
    } else if (before === undefined && after) {
      // Only the "after" constraint
      const afterUTC = toUTCDate(after);
      dates = rruleSet.all(
        (date, i) => (inclusive ? date >= afterUTC : date > afterUTC) && i < limit,
      );
    } else if (before && after) {
      // Both constraints
      dates = rruleSet.between(toUTCDate(after), toUTCDate(before), inclusive, (_, i) => i < limit);
    }

    // The sort is necessary because the order of dates is not guaranteed when using exclusion / inclusion dates
    dates.sort((a, b) => a.valueOf() - b.valueOf());
    return dates.map((d) => fromDate(d, this.tzid));
  }

  /**
   * Create a new Recurrence object with updated properties.
   * @param props Partial properties to update
   * @returns New Recurrence object with the updated properties
   */
  update(props: Partial<RecurrenceProps>): Recurrence {
    let rule = this.recurrenceOptions as Partial<RecurrenceOptions>;
    if (props.rule) {
      const { until, count, ...rest } =
        props.rule instanceof RRule
          ? (toRecurrenceOptions(props.rule.options) as RecurrenceOptions)
          : props.rule;

      rule = {
        ...rule,
        ...noUndefined(rest),
      };

      if (count) {
        rule.count = count;
        rule.until = undefined;
      } else if (until) {
        rule.until = until;
        rule.count = undefined;
      }
    }

    return new Recurrence({
      tzid: props.tzid ?? this.tzid,
      duration: props.duration ?? this.duration,
      rdates: props.rdates ?? this.rdates,
      exdates: props.exdates ?? this.exdates,
      rule,
    });
  }

  /**
   * Get a human-readable string representing the recurrence pattern.
   * @returns A human-readable string representing the recurrence pattern.
   */
  toText(): string {
    const start = this.dtStart.toDate().toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const rrule = new RRule(fromRecurrenceOptions(this.recurrenceOptions));
    const pattern = rrule.toText();
    return `starting ${start}, occurs ${pattern}`;
  }

  formattedDuration(): string {
    return formattedDuration(this.duration);
  }

  /**
   * Get the options of the recurrence pattern.
   */
  get recurrenceOptions(): RecurrenceOptions {
    return toRecurrenceOptions(this._rrule.options) as RecurrenceOptions;
  }

  /**
   * Update the recurrence pattern options, but keep the start date the same.
   */
  set recurrenceOptions(options: RecurrenceOptions) {
    this._rrule = new RRule(fromRecurrenceOptions(options));
  }

  /**
   * Get the RRule object representing the recurrence pattern.
   */
  get rrule(): RRule {
    return new RRule(this._rrule.origOptions);
  }

  /**
   * Check if the recurrence pattern is finite (i.e. has a count or until date).
   */
  get isFinite(): boolean {
    return this._rrule.options.count !== null || this._rrule.options.until !== null;
  }

  /**
   * Get the start date of the recurrence pattern.
   */
  get dtStart(): ZonedDateTime {
    const dtstart = this._rrule.options.dtstart;
    return fromDate(dtstart, this.tzid);
  }

  /**
   * Set the start date of the recurrence pattern.
   */
  set dtStart(zdt: ZonedDateTime) {
    this._rrule.options.dtstart = toUTCDate(zdt);
  }
}

export { Recurrence, TimeSlot, type RecurrenceOptions, type RecurrenceProps };
