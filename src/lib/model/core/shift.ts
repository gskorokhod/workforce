import { Recurrence } from "$lib/model/temporal";
import { Icon, type Display } from "$lib/ui";
import { copyArr } from "$lib/utils";
import { getLocalTimeZone, now, type DateValue } from "@internationalized/date";
import { RRule } from "rrule";
import type { JsonObject, JsonValue } from "type-fest";
import { Base } from "./base";
import { revivedArr } from "./misc";
import { ShiftOccurrence } from "./occurrence";
import { State } from "./state";
import { Task } from "./task";

/**
 * Represents a shift that a person can work.
 * @interface
 * @property {Recurrence} pattern - The pattern of the shift.
 * @property {Task[]} tasks - The tasks to be done during the shift.
 * @property {string} name - The name of the shift.
 * @property {Icon} icon - The icon representing the shift. Icon color will be used as the color of the shift.
 */
interface IShift extends Display {
  pattern: Recurrence;
  tasks: Task[];
}

/**
 * Represents a shift that a person can work.
 */
export class Shift extends Base implements IShift {
  name: string;
  description?: string;
  icon?: Icon;
  pattern: Recurrence;
  private _tasks: Task[];

  /**
   * Creates a new shift.
   * @param props Properties of the shift.
   * @param state State to bind the shift to.
   * @param uuid UUID of the shift. If not provided, a new UUID is generated.
   */
  constructor(props: Partial<IShift>, state?: State, uuid?: string) {
    super(state, uuid);

    this.name = props.name || "";
    this.description = props.description || "";
    this.icon = props.icon;
    this._tasks = props.tasks || [];

    this.pattern =
      props.pattern ||
      new Recurrence({
        tzid: getLocalTimeZone(),
        rule: {
          dtstart: now(getLocalTimeZone()),
          freq: RRule.DAILY,
          interval: 1,
        },
      });
  }

  /**
   * Creates a shift from a JSON object.
   * @param json JSON object to create the shift from.
   * @param state State to bind the shift to and revive references.
   * @returns new Shift
   */
  static fromJSON(json: JsonValue, state?: State): Shift {
    const { name, description, icon, pattern, tasks, uuid } = json as JsonObject;
    return new Shift(
      {
        name: name as string,
        description: description as string,
        icon: icon ? Icon.fromJSON(icon as JsonObject) : undefined,
        pattern: Recurrence.fromJSON(pattern as JsonObject),
        tasks: revivedArr(Task, tasks, state),
      },
      state,
      typeof uuid === "string" ? uuid : undefined,
    );
  }

  /**
   * Serialize the shift to a JSON object.
   * @returns JSON object representing the shift.
   */
  toJSON(): JsonObject {
    return {
      uuid: this.uuid,
      name: this.name,
      description: this.description || "",
      icon: this.icon?.toJSON() || null,
      pattern: this.pattern.toJSON(),
      tasks: this.tasks.map((task) => task.toJSON()),
    };
  }

  /**
   * Copy the shift.
   * @returns new Shift with the same properties.
   */
  copy(): Shift {
    return new Shift(
      {
        pattern: this.pattern.copy(),
        tasks: copyArr(this._tasks),
        name: this.name,
        description: this.description,
        icon: this.icon?.copy(),
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
   * @returns Occurrence object or undefined if not found.
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

  /**
   * Add a task to the shift, with an optional duration.
   * If the task is already in the shift, its duration is updated.
   * @param task Task to add.
   * @param duration Duration of the task. If not set, the task will last the whole shift.
   */
  putTask(task: Task): void {
    if (!this._tasks.some((t) => t.eq(task))) {
      this._tasks.push(task.copy());
    }
  }

  /**
   * Remove a task from the shift.
   * @param task Task to remove.
   */
  removeTask(task: Task): void {
    this._tasks = this._tasks.filter((t) => !t.eq(task));
  }

  /**
   * Get the tasks of the shift, with their durations.
   */
  get tasks(): Task[] {
    if (!this.state) {
      return copyArr(this._tasks);
    }

    this._tasks.forEach((task) => (task.state = this.state));
    return this._tasks.map((t) => t.get()).filter((t) => t !== undefined) as Task[];
  }

  /**
   * Set the tasks of the shift.
   * @param tasks Tasks to be done during the shift.
   */
  set tasks(tasks: Task[]) {
    this._tasks = copyArr(tasks);
  }
}
