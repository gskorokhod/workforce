import { Recurrence } from "$lib/backend/temporal";
import { completeDuration } from "$lib/backend/temporal/utils";
import { Icon, type Display } from "$lib/backend/ui";
import { eq, HashMap } from "$lib/backend/utils";
import { getLocalTimeZone, now, ZonedDateTime, type TimeDuration } from "@internationalized/date";
import { RRule } from "rrule";
import type { JsonObject, JsonValue } from "type-fest";
import { Base } from "./base";
import { ShiftOccurrence } from "./occurrence";
import { State } from "./state";
import { Task } from "./task";

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
  name: string;
  description?: string;
  icon?: Icon;
  pattern: Recurrence;
  private _tasks: HashMap<Task, TimeDuration | undefined>;

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

    this.pattern =
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
        this._tasks.set(task.copy(), copyDuration(this.pattern.duration));
      });
    } else {
      tasks.forEach((duration, task) => {
        this._tasks.set(task.copy(), copyDuration(duration));
      });
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
  toJSON(): JsonObject {
    return {
      uuid: this.uuid,
      name: this.name,
      description: this.description || "",
      icon: this.icon?.toJSON() || null,
      pattern: this.pattern.toJSON(),
      tasks: tasksJSON(this.tasks)
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
        tasks: tasksCopy(this._tasks),
        name: this.name,
        description: this.description,
        icon: this.icon?.copy()
      },
      this.state,
      this.uuid
    );
  }

  /**
   * Get the n-th occurrence of the shift (0-indexed).
   * @param n Index of the occurrence.
   * @param tzid Timezone ID. Defaults to local timezone.
   * @returns Occurrence object or undefined if not found.
   * @see {@link Recurrence.getOccurrence}
   */
  getOccurrence(n: number = 0, tzid: string = getLocalTimeZone()): ShiftOccurrence | undefined {
    const occurrence = this.pattern.getOccurrence(n, tzid);
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
    const occurrence = this.pattern.getOccurrenceOn(date, tzid);
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
    const occurrences = this.pattern.getOccurrences(after, before, tzid, inclusive, limit);
    return occurrences.map(({ start, end }) => new ShiftOccurrence(start, end, this.copy()));
  }

  /**
   * Add a task to the shift, with an optional duration.
   * If the task is already in the shift, its duration is updated.
   * @param task Task to add.
   * @param duration Duration of the task. If not set, the task will last the whole shift.
   */
  putTask(task: Task, duration?: TimeDuration): void {
    this._tasks.set(task.copy(), duration || this.pattern.duration);
  }

  /**
   * Remove a task from the shift.
   * @param task Task to remove.
   */
  removeTask(task: Task): void {
    this._tasks.delete(task);
  }

  /**
   * Get the tasks of the shift, with their durations.
   */
  get tasks(): Map<Task, TimeDuration | undefined> {
    let ans = this._tasks;
    if (this.state) {
      ans = new HashMap<Task, TimeDuration | undefined>(undefined, undefined, eq);
      this._tasks.forEach((duration, task) => {
        const t = task.get();
        if (t) {
          ans.set(t as Task, duration);
        }
      });
    }
    return tasksCopy(ans);
  }

  /**
   * Set the tasks of the shift.
   * @param tasks Tasks to be done during the shift.
   */
  set tasks(tasks: Map<Task, TimeDuration | undefined> | Task[]) {
    this.initialiseTasks(tasks);
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
