import { Recurrence } from "$lib/model/temporal";
import { timeDurationSchema } from "$lib/model/temporal/utils";
import { type Display } from "$lib/ui";
import {
  CalendarDate,
  isSameDay,
  Time,
  type DateValue,
  type TimeDuration,
} from "@internationalized/date";
import { get as _get, derived, writable, type Readable, type Writable } from "svelte/store";
import type { JsonObject } from "type-fest";
import { z } from "zod";
import { Assignment, SimpleAssignment } from "./assignment";
import { Displayable } from "./displayable";
import { uuidsOf, type IdOr } from "./misc";
import { ShiftOccurrence } from "./occurrence";
import { subset, type State } from "./state";
import type { Task } from "./task";

interface SimplePattern {
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
  pattern: Recurrence;
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

    if (props.pattern instanceof Recurrence) {
      this.pattern = props.pattern;
    } else {
      const { planningHorizonEnd, planningHorizonStart } = _get(state.settings);
      this.pattern = Recurrence.daily({
        startDate: planningHorizonStart,
        endDate: planningHorizonEnd,
        start: props.pattern.start,
        end: props.pattern.end,
      });
    }
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
        pattern: Recurrence.fromJSON(json.pattern),
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
      pattern: this.pattern.toJSON(),
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
        pattern: this.pattern.copy(),
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
    const occurrence = this.pattern.occurrence(n);
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
    const occurrences = this.pattern.occurrencesOn(date);
    return occurrences.map(({ start, end }) => new ShiftOccurrence(start, end, this.copy()));
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
    const occurrences = this.pattern.occurrences(after, before, inclusive, limit);
    return occurrences.map(({ start, end }) => new ShiftOccurrence(start, end, this.copy()));
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

  rAssignments(on?: CalendarDate): Readable<Assignment[]> {
    return derived(this.state.assignments, (assignments) =>
      assignments.filter((a) => {
        if (on && !isSameDay(a.date, on)) {
          return false;
        }
        if (a instanceof SimpleAssignment) {
          return a.shift?.eq(this);
        }
        // TODO: Implement complex assignments
        return false;
      }),
    );
  }
}
