import { Recurrence } from "$lib/model/temporal";
import { timeDurationSchema } from "$lib/model/temporal/utils";
import { type Display } from "$lib/ui";
import {
  CalendarDate,
  parseTime,
  Time,
  toTime,
  type DateValue,
  type TimeDuration,
} from "@internationalized/date";
import { get as _get, derived, writable, type Readable, type Writable } from "svelte/store";
import type { JsonObject, JsonValue } from "type-fest";
import { z } from "zod";
import { type Assignment } from "./assignment";
import { Displayable } from "./displayable";
import { uuidsOf, type IdOr } from "./misc";
import { ShiftOccurrence } from "./occurrence";
import { subset, type State } from "./state";
import type { Task } from "./task";

export interface SimplePattern {
  start: Time;
  end: Time;
}

/**
 * Represents a shift that a person can work.
 * @interface
 * @property {Recurrence} pattern - The pattern of the shift.
 * @property {IdOr<Task>[]} tasks - The tasks to be done during the shift.
 * @property {string} name - The name of the shift.
 * @property {Icon} icon - The icon representing the shift. Icon color will be used as the color of the shift.
 */
interface ShiftProps extends Display {
  pattern: Recurrence | SimplePattern;
  tasks?: IdOr<Task>[];
  paidDuration?: TimeDuration;
}

/**
 * Represents a shift that a person can work.
 */
export class Shift extends Displayable {
  rPattern: Writable<Recurrence | SimplePattern>;
  private _paidDuration?: TimeDuration;
  private _task_uuids: Writable<string[]>;

  /**
   * Creates a new shift.
   * @param props Properties of the shift.
   * @param state State to bind the shift to.
   * @param uuid UUID of the shift. If not provided, a new UUID is generated.
   */
  constructor(props: ShiftProps, state: State, uuid?: string) {
    super(props, state, uuid);

    this._task_uuids = writable(uuidsOf(props.tasks || []));
    this._paidDuration = props.paidDuration;
    this.rPattern = writable(props.pattern);
  }

  /**
   * Creates a shift from a JSON object.
   * @param json JSON object to create the shift from.
   * @param state State to bind the shift to and revive references.
   * @returns new Shift
   */
  static fromJSON(json: JsonObject, state: State): Shift {
    return new Shift(
      {
        ...super.fromJSON(json, state),
        pattern: patternFromJSON(json.pattern),
        tasks: z
          .array(z.string())
          .nullish()
          .transform((x) => x ?? undefined)
          .parse(json.tasks),
        paidDuration: timeDurationSchema
          .nullish()
          .transform((x) => x ?? undefined)
          .parse(json.paidDuration),
      },
      state,
      z.optional(z.string()).parse(json.uuid),
    );
  }

  /**
   * Serialize the shift to a JSON object.
   * @returns JSON object representing the shift.
   */
  toJSON(): JsonObject {
    return {
      ...super.toJSON(),
      pattern: patternJSON(_get(this.rPattern)),
      tasks: _get(this._task_uuids),
      paidDuration: this._paidDuration ? (this._paidDuration as JsonObject) : null,
    };
  }

  /**
   * Copy the shift.
   * @returns new Shift with the same properties.
   */
  copy(): Shift {
    return new Shift(
      {
        ...super.copy(),
        pattern: patternCopy(_get(this.rPattern)),
        tasks: _get(this._task_uuids),
        paidDuration: this._paidDuration,
      },
      this.state,
      this.uuid,
    );
  }

  /**
   * Get the n-th occurrence of the shift (0-indexed).
   * @param n Index of the occurrence.
   * @param tzid Timezone ID. Defaults to local timezone.
   * @returns Occurrence object or undefined if not found.
   * @see {@link Recurrence.occurrence}
   */
  occurrence(n = 0): ShiftOccurrence | undefined {
    const occurrence = this.recurrence.occurrence(n);
    if (occurrence) {
      const { start, end } = occurrence;
      return new ShiftOccurrence(start, end, this.copy());
    }
    return undefined;
  }

  /**
   * Get the occurrence of the shift on a specific date.
   * @param date Date to get the occurrence for.
   * @param tzid Timezone ID. Defaults to local timezone.
   * @returns List of occurrences on the date.
   * @see {@link Recurrence.occurrencesOn}
   */
  occurrencesOn(date: DateValue): ShiftOccurrence[] {
    const occurrences = this.recurrence.occurrencesOn(date);
    return occurrences.map(({ start, end }) => new ShiftOccurrence(start, end, this.copy()));
  }

  occursOn(date: DateValue): boolean {
    const occurrences = this.recurrence.occurrencesOn(date);
    return occurrences.length > 0;
  }

  /**
   * Get all occurrences of the shift within a time range.
   * @param after Start of the time range. If not set, starts from the first occurrence.
   * @param before End of the time range. If not set, ends at the last occurrence. (If the pattern is infinite, `limit` will be used to stop the search.)
   * @param tzid Timezone ID. Defaults to local timezone.
   * @param inclusive If true, includes the `after` and `before` dates in the result. Defaults to true.
   * @param limit Limit the number of occurrences returned. If `after` and `before` are both set, there is no limit by default. Otherwise, defaults to 100. Either way, you can set a custom limit.
   * @returns Array of occurrences.
   * @warning High `limit` values can cause performance issues, so it is recommended to keep the default behaviour or set a reasonable limit.
   * @see {@link Recurrence.occurrences}
   */
  occurrences(
    after: DateValue | undefined = undefined,
    before: DateValue | undefined = undefined,
    inclusive = true,
    limit = -1,
  ): ShiftOccurrence[] {
    const occurrences = this.recurrence.occurrences(after, before, inclusive, limit);
    return occurrences.map(({ start, end }) => new ShiftOccurrence(start, end, this.copy()));
  }

  /**
   * Get all assignments for this shift.
   * @param on Optional date to filter assignments by.
   * @returns Readable store of assignments.
   */
  rAssignments(on?: CalendarDate): Readable<Assignment[]> {
    return derived(this.state.assignments, (assignments) => {
      let data = [];
      if (on) {
        data = assignments.byDate.get(on) || [];
      } else {
        data = assignments.entries;
      }
      return data.filter((assignment) => assignment.shift && assignment.shift.eq(this));
    });
  }

  assignments(on?: CalendarDate): Assignment[] {
    return _get(this.rAssignments(on));
  }

  get tasks(): Task[] {
    return _get(this.rTasks);
  }

  set tasks(tasks: Task[]) {
    this.rTasks.set(tasks);
  }

  get rTasks(): Writable<Task[]> {
    return subset(this.state._tasks, this._task_uuids);
  }

  get paidDuration(): TimeDuration {
    if (this._paidDuration) {
      return this._paidDuration;
    }
    const dur = this.recurrence.duration || {
      hours: 23,
      minutes: 59,
    };
    return dur;
  }

  set paidDuration(duration: TimeDuration) {
    this._paidDuration = duration;
  }

  get recurrence(): Recurrence {
    return toRecurrence(_get(this.rPattern), this.state);
  }
}

export function toRecurrence(pattern: Recurrence | SimplePattern, state: State) {
  if (pattern instanceof Recurrence) {
    return pattern;
  } else {
    const { planningHorizonEnd, planningHorizonStart } = _get(state.settings);
    return Recurrence.daily({
      startDate: planningHorizonStart,
      endDate: planningHorizonEnd,
      start: pattern.start,
      end: pattern.end,
    });
  }
}

export function toSimplePattern(pattern: Recurrence | SimplePattern) {
  if (pattern instanceof Recurrence) {
    const start = toTime(pattern.dtStart);
    const end = pattern.duration ? toTime(pattern.dtStart.add(pattern.duration)) : new Time(23, 59);
    return { start, end };
  } else {
    return pattern;
  }
}

function patternCopy(pattern: Recurrence | SimplePattern): Recurrence | SimplePattern {
  if (pattern instanceof Recurrence) {
    return pattern.copy();
  } else {
    return { ...pattern };
  }
}

function patternJSON(pattern: Recurrence | SimplePattern): JsonObject {
  if (pattern instanceof Recurrence) {
    return {
      ...pattern.toJSON(),
      type: "recurrence",
    };
  } else {
    return {
      start: pattern.start.toString(),
      end: pattern.end.toString(),
      type: "simple",
    };
  }
}

function patternFromJSON(json: JsonValue): Recurrence | SimplePattern {
  if (typeof json !== "object" || json === null) {
    throw new Error("Invalid JSON");
  }
  json = json as JsonObject;
  if (json.type === "recurrence") {
    return Recurrence.fromJSON(json);
  } else {
    return {
      start: z
        .string()
        .transform((s) => parseTime(s))
        .parse(json.start),
      end: z
        .string()
        .transform((s) => parseTime(s))
        .parse(json.end),
    };
  }
}
