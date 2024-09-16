import { Recurrence } from "$lib/model/temporal";
import { completeDuration } from "$lib/model/temporal/utils";
import { eq, HashMap } from "$lib/model/utils";
import { getLocalTimeZone, now, type TimeDuration } from "@internationalized/date";
import { RRule } from "rrule";
import type { JsonObject, JsonValue } from "type-fest";
import { Base } from "../base";
import { State } from "../state";
import { Task } from "../task";

interface IShift {
  pattern: Recurrence;
  tasks: Task[] | Map<Task, TimeDuration | undefined>;
  name: string;
}

export class Shift extends Base implements IShift {
  private _pattern: Recurrence;
  private _tasks: HashMap<Task, TimeDuration | undefined>;
  private _name: string;

  constructor(props: Partial<IShift>, state?: State, uuid?: string) {
    super(state, uuid);

    this._pattern =
      props.pattern ||
      new Recurrence({
        dtstart: now(getLocalTimeZone()),
        rrule: {
          freq: RRule.DAILY,
          interval: 1
        }
      });
    this._name = props.name || "";
    this._tasks = new HashMap(undefined, undefined, eq);

    if (props.tasks) {
      this.initialiseTasks(props.tasks);
    }
  }

  private initialiseTasks(tasks: Task[] | Map<Task, TimeDuration | undefined>): void {
    if (tasks instanceof Map) {
      tasks.forEach((duration, task) => {
        this._tasks.set(task.copy(), copyDuration(duration || this._pattern.duration));
      });
    } else {
      tasks.forEach((task) => {
        this._tasks.set(task.copy(), copyDuration(this._pattern.duration));
      });
    }
  }

  static fromJSON(json: JsonValue, state?: State): Shift {
    const { uuid, pattern, tasks, name } = json as JsonObject;
    return new Shift(
      {
        pattern: Recurrence.fromJSON(pattern as JsonObject),
        tasks: tasksParse(tasks, state),
        name: name as string
      },
      state,
      uuid as string
    );
  }

  toJSON(): JsonValue {
    return {
      uuid: this.uuid,
      pattern: this._pattern.toJSON(),
      tasks: tasksJSON(this._tasks),
      name: this._name
    };
  }

  dependencies(): Base[] {
    return Array.from(this._tasks.keys());
  }

  removeDependency(dep: Base): void {
    if (dep instanceof Task) {
      this.removeTask(dep);
    }
  }

  copy(): Shift {
    return new Shift(
      {
        pattern: this._pattern.copy(),
        tasks: tasksCopy(this._tasks),
        name: this._name
      },
      this._state,
      this.uuid
    );
  }

  update(force?: boolean): boolean {
    if (super.update(force)) {
      const shift = this.get() as Shift;
      this._pattern = shift._pattern;
      this._tasks = shift._tasks;
      this._name = shift._name;
      return true;
    }
    return false;
  }

  setTask(task: Task, duration?: TimeDuration): void {
    this._tasks.set(task, duration || this._pattern.duration);
    this.touch();
  }

  removeTask(task: Task): void {
    this._tasks.delete(task);
    this.touch();
  }

  get pattern(): Recurrence {
    this.update();
    return this._pattern.copy();
  }

  get tasks(): Map<Task, TimeDuration | undefined> {
    this.update();
    return tasksCopy(this._tasks);
  }

  get name(): string {
    this.update();
    return this._name;
  }

  set name(name: string) {
    this._name = name;
    this.touch();
  }

  set tasks(tasks: Map<Task, TimeDuration | undefined> | Task[]) {
    this._tasks = new HashMap(undefined, undefined, eq);
    this.initialiseTasks(tasks);
    this.touch();
  }

  set pattern(pattern: Recurrence) {
    this._pattern = pattern.copy();
    this.touch();
  }
}

function tasksCopy(
  tasks: Map<Task, TimeDuration | undefined>
): HashMap<Task, TimeDuration | undefined> {
  const ans: HashMap<Task, TimeDuration | undefined> = new HashMap(undefined, undefined, eq);

  tasks.forEach((duration, task) => {
    ans.set(task.copy(), copyDuration(duration));
  });

  return ans;
}

function tasksParse(json: JsonValue, state?: State): HashMap<Task, TimeDuration | undefined> {
  const ans: HashMap<Task, TimeDuration | undefined> = new HashMap(undefined, undefined, eq);

  for (const [task, duration] of json as [JsonValue, JsonValue][]) {
    const dur = duration ? (duration as TimeDuration) : undefined;
    ans.set(Task.fromJSON(task, state), dur);
  }

  return ans;
}

function tasksJSON(tasks: Map<Task, TimeDuration | undefined>): JsonValue {
  const ans: [JsonValue, JsonValue][] = [];

  tasks.forEach((duration, task) => {
    ans.push([task.toJSON(), duration ? completeDuration(duration) : null]);
  });

  return ans;
}

function copyDuration(duration: TimeDuration | undefined): TimeDuration | undefined {
  return duration ? (completeDuration(duration) as TimeDuration) : undefined;
}
