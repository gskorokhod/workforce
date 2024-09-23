import { Recurrence } from "$lib/model/temporal";
import { completeDuration } from "$lib/model/temporal/utils";
import { Icon, type Display } from "$lib/model/ui";
import { eq, HashMap } from "$lib/model/utils";
import { getLocalTimeZone, now, ZonedDateTime, type TimeDuration } from "@internationalized/date";
import { RRule } from "rrule";
import type { JsonObject, JsonValue } from "type-fest";
import { Base } from "../base";
import { State } from "../state";
import { Task } from "../task";
import { ShiftOccurrence } from "./occurrence";

/**
 * Represents a shift that a person can work.
 * @interface
 * @property {Recurrence} pattern - The pattern of the shift.
 * @property {Task[] | Map<Task, TimeDuration | undefined>} tasks - The tasks to be done during the shift, optionally with durations.
 * @property {string} name - The name of the shift.
 * @property {Icon} icon - The icon representing the shift. Icon color will be used as the color of the shift.
 */
interface IShift extends Display {
  pattern: Recurrence;
  tasks: Task[] | Map<Task, TimeDuration | undefined>;
}

/**
 * Represents a shift that a person can work.
 */
export class Shift extends Base implements IShift {
  private _name: string;
  private _description?: string;
  private _icon?: Icon;
  private _pattern: Recurrence;
  private _tasks: HashMap<Task, TimeDuration | undefined>;

  /**
   * Creates a new shift.
   * @param props Properties of the shift.
   * @param state State to bind the shift to.
   * @param uuid UUID of the shift. If not provided, a new UUID is generated.
   */
  constructor(props: Partial<IShift>, state?: State, uuid?: string) {
    super(state, uuid);

    this._name = props.name || "";
    this._description = props.description || "";
    this._icon = props.icon;

    this._pattern =
      props.pattern ||
      new Recurrence({
        dtstart: now(getLocalTimeZone()),
        rrule: {
          freq: RRule.DAILY,
          interval: 1
        }
      });

    this._tasks = new HashMap(undefined, undefined, eq);
    if (props.tasks) {
      this.initialiseTasks(props.tasks);
    }
  }

  /**
   * Initialise the tasks of the shift.
   * @param tasks Tasks to be done during the shift.
   */
  private initialiseTasks(tasks: Task[] | Map<Task, TimeDuration | undefined>): void {
    this._tasks = new HashMap(undefined, undefined, eq);
    if (Array.isArray(tasks)) {
      tasks.forEach((task) => {
        this._tasks.set(task.copy(), copyDuration(this._pattern.duration));
      });
      // tasks.forEach((duration, task) => {
      //   this._tasks.set(task.copy(), copyDuration(duration || this._pattern.duration));
      // });
    } else {
      tasks.forEach((duration, task) => {
        this._tasks.set(task.copy(), copyDuration(duration));
      });
      // tasks.forEach((task) => {
      //   this._tasks.set(task.copy(), copyDuration(this._pattern.duration));
      // });
    }
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
        tasks: tasksParse(tasks, state)
      },
      state,
      typeof uuid === "string" ? uuid : undefined
    );
  }

  /**
   * Serialize the shift to a JSON object.
   * @returns JSON object representing the shift.
   */
  toJSON(): JsonValue {
    return {
      name: this._name,
      description: this._description || "",
      icon: this._icon?.toJSON() || null,
      pattern: this._pattern.toJSON(),
      tasks: tasksJSON(this._tasks)
    };
  }

  /**
   * Get objects in the state that the shift depends on.
   * @returns Array of dependencies.
   */
  dependencies(): Base[] {
    return Array.from(this._tasks.keys());
  }

  /**
   * Handle a dependency being removed from the state.
   * @param dep Dependency to remove.
   */
  removeDependency(dep: Base): void {
    if (dep instanceof Task) {
      this.removeTask(dep);
    }
  }

  /**
   * Copy the shift.
   * @returns new Shift with the same properties.
   */
  copy(): Shift {
    return new Shift(
      {
        pattern: this._pattern.copy(),
        tasks: tasksCopy(this._tasks),
        name: this._name,
        description: this._description,
        icon: this._icon?.copy()
      },
      this._state,
      this.uuid
    );
  }

  /**
   * Update the shift with the current value from the state.
   * @param force If true, local data is overwritten even if it is newer than the state. Default is false.
   * @returns True if the local state has been updated, false otherwise.
   */
  update(force?: boolean): boolean {
    if (super.update(force)) {
      const shift = this.get() as Shift;
      this._name = shift._name;
      this._description = shift._description;
      this._icon = shift._icon;
      this._pattern = shift._pattern;
      this._tasks = shift._tasks;
      return true;
    }
    return false;
  }

  /**
   * Get the n-th occurrence of the shift (0-indexed).
   * @param n Index of the occurrence.
   * @param tzid Timezone ID. Defaults to local timezone.
   * @returns Occurrence object or undefined if not found.
   * @see {@link Recurrence.getOccurrence}
   */
  getOccurrence(n: number = 0, tzid: string = getLocalTimeZone()): ShiftOccurrence | undefined {
    const occurrence = this._pattern.getOccurrence(n, tzid);
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
   * @see {@link Recurrence.getOccurrenceOn}
   */
  getOccurrenceOn(
    date: ZonedDateTime,
    tzid: string = getLocalTimeZone()
  ): ShiftOccurrence | undefined {
    const occurrence = this._pattern.getOccurrenceOn(date, tzid);
    if (occurrence) {
      const { start, end } = occurrence;
      return new ShiftOccurrence(start, end, this.copy());
    }
    return undefined;
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
   * @see {@link Recurrence.getOccurrences}
   */
  getOccurrences(
    after: ZonedDateTime | undefined = undefined,
    before: ZonedDateTime | undefined = undefined,
    tzid: string = getLocalTimeZone(),
    inclusive: boolean = true,
    limit: number = -1
  ): ShiftOccurrence[] {
    const occurrences = this._pattern.getOccurrences(after, before, tzid, inclusive, limit);
    return occurrences.map(({ start, end }) => new ShiftOccurrence(start, end, this.copy()));
  }

  /**
   * Add a task to the shift, with an optional duration.
   * If the task is already in the shift, its duration is updated.
   * @param task Task to add.
   * @param duration Duration of the task. If not set, the task will last the whole shift.
   */
  putTask(task: Task, duration?: TimeDuration): void {
    this._tasks.set(task, duration || this._pattern.duration);
    this.touch();
  }

  /**
   * Remove a task from the shift.
   * @param task Task to remove.
   */
  removeTask(task: Task): void {
    this._tasks.delete(task);
    this.touch();
  }

  /**
   * Get the name of the shift.
   */
  get name(): string {
    this.update();
    return this._name;
  }

  /**
   * Get the description of the shift.
   */
  get description(): string {
    this.update();
    return this._description || "";
  }

  /**
   * Get the icon representing the shift.
   */
  get icon(): Icon | undefined {
    this.update();
    return this._icon?.copy();
  }

  /**
   * Get the recurrence pattern of the shift.
   */
  get pattern(): Recurrence {
    this.update();
    return this._pattern.copy();
  }

  /**
   * Get the tasks of the shift, with their durations.
   */
  get tasks(): Map<Task, TimeDuration | undefined> {
    this.update();
    return tasksCopy(this._tasks);
  }

  /**
   * Set the name of the shift.
   */
  set name(name: string) {
    this._name = name;
    this.touch();
  }

  /**
   * Set the description of the shift.
   */
  set description(description: string) {
    this._description = description;
    this.touch();
  }

  /**
   * Set the icon representing the shift.
   */
  set icon(icon: Icon | undefined) {
    this._icon = icon;
    this.touch();
  }

  /**
   * Set the tasks of the shift.
   * @param tasks Tasks to be done during the shift.
   */
  set tasks(tasks: Map<Task, TimeDuration | undefined> | Task[]) {
    this.initialiseTasks(tasks);
    this.touch();
  }

  /**
   * Set the recurrence pattern of the shift.
   * @param pattern New pattern.
   */
  set pattern(pattern: Recurrence) {
    this._pattern = pattern.copy();
    this.touch();
  }
}

/**
 * Helper function to cop a map of tasks to durations.
 * @param tasks Map of tasks to durations.
 * @returns new HashMap with copied tasks and durations.
 */
function tasksCopy(
  tasks: Map<Task, TimeDuration | undefined>
): HashMap<Task, TimeDuration | undefined> {
  const ans: HashMap<Task, TimeDuration | undefined> = new HashMap(undefined, undefined, eq);

  tasks.forEach((duration, task) => {
    ans.set(task.copy(), copyDuration(duration));
  });

  return ans;
}

/**
 * Helper function to parse a JSON object into a map of tasks to durations.
 * @param json JSON object to parse.
 * @param state State to bind the tasks to.
 * @returns new HashMap with tasks and durations.
 */
function tasksParse(json: JsonValue, state?: State): HashMap<Task, TimeDuration | undefined> {
  const ans: HashMap<Task, TimeDuration | undefined> = new HashMap(undefined, undefined, eq);

  for (const [task, duration] of json as [JsonValue, JsonValue][]) {
    const dur = duration ? (duration as TimeDuration) : undefined;
    ans.set(Task.fromJSON(task, state), dur);
  }

  return ans;
}

/**
 * Helper function to convert a map of tasks to durations to a JSON object.
 * @param tasks Tasks to convert.
 * @returns Array of `[Task, TimeDuration | null]` pairs.
 */
function tasksJSON(tasks: Map<Task, TimeDuration | undefined>): JsonValue {
  const ans: [JsonValue, JsonValue][] = [];

  tasks.forEach((duration, task) => {
    ans.push([task.toJSON(), duration ? completeDuration(duration) : null]);
  });

  return ans;
}

/**
 * Helper function to copy a duration.
 * @param duration Time duration to copy.
 * @returns new TimeDuration or undefined if not set.
 */
function copyDuration(duration: TimeDuration | undefined): TimeDuration | undefined {
  return duration ? (completeDuration(duration) as TimeDuration) : undefined;
}
