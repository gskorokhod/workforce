import { Icon, type Display } from "$lib/ui";
import { copyArr, has, hasAll, without } from "$lib/utils";
import { get } from "svelte/store";
import type { JsonObject, JsonValue } from "type-fest";
import { Assignment } from "./assignment";
import { Base } from "./base";
import { displayFromJSON, displayToJSON, revivedArr } from "./misc";
import { Person } from "./person";
import { Qualification } from "./qualification";
import { State } from "./state";

type WithArg = Qualification | Qualification[];

interface TaskMinMax {
  people: number;
}

interface ITask extends Display {
  qualifications: Qualification[];
  min: TaskMinMax;
  max: TaskMinMax;
}

export class Task extends Base implements ITask {
  name: string;
  description?: string;
  icon?: Icon;
  min: TaskMinMax;
  max: TaskMinMax;
  private _qualifications: Qualification[] = [];

  constructor(props: Partial<ITask>, state?: State, uuid?: string) {
    super(state, uuid);
    this.name = props.name || "";
    this.description = props.description || "";
    this.icon = props.icon;
    this.min = { people: props.min?.people || 0 };
    this.max = { people: props.max?.people || Infinity };
    this._qualifications = props.qualifications || [];
  }

  /**
   * Get a task by UUID from a state or array of tasks.
   * @param from State or array of tasks to search.
   * @param uuid UUID of the task to get.
   * @returns Task with the given UUID or undefined if not found.
   */
  static get(from: State | Task[], uuid: string): Task | undefined {
    if (from instanceof State) {
      return get(from._tasks).get(uuid)?.copy();
    }
    return from.find((task) => task.uuid === uuid)?.copy();
  }

  /**
   * Get all tasks from a state or array of tasks.
   * @param from State or array of tasks to search.
   * @returns All tasks in the state or array.
   */
  static getAll(from: State | Task[]): Task[] {
    if (from instanceof State) {
      return copyArr(Array.from(get(from._tasks).values()));
    }
    return copyArr(from);
  }

  /**
   * Get all tasks that require a set of qualifications.
   *
   * @param from A state or array of tasks to search.
   * @param args Each argument is a qualification or an array of qualifications. An argument matches if the task requires all the qualifications in the argument. If multiple arguments are provided, all tasks that match at least one argument are returned. (See examples)
   * @returns Array of tasks that require the specified qualifications.
   *
   * @example `Task.getRequiring(state, qualification1, qualification2)` - Returns tasks that require `qualification1` or `qualification2`
   * @example `Task.getRequiring(state, [qualification1, qualification2])` - Returns tasks that require both `qualification1` and `qualification2`
   * @example `Task.getRequiring(state, qualification1, [qualification2, qualification3])` - Returns tasks that require either `qualification1` or both `qualification2` and `qualification3`
   */
  static getRequiring(from: State | Task[], ...args: WithArg[]): Task[] {
    const tasks = Task.getAll(from);
    const ans: Task[] = [];

    for (const arg of args) {
      let filtered: Task[] = [];

      if (arg instanceof Qualification) {
        filtered = tasks.filter((task) => has(task.qualifications, arg));
      } else {
        filtered = tasks.filter((task) => hasAll(task.qualifications, arg));
      }

      filtered.forEach((task) => {
        if (!has(ans, task)) {
          ans.push(task);
        }
      });
    }

    return ans;
  }

  /**
   * Get tasks that can be done by a person with a given set of qualifications.
   * @param from State or array of tasks to search.
   * @param target `Person` object representing the candidate, or an array of `qualification` objects.
   * @returns Array of tasks that can be done by a person with the specified qualifications.
   */
  static getSuitable(from: State | Task[], target: Qualification[] | Person) {
    const quals = target instanceof Person ? target.qualifications : target;
    const tasks = Task.getAll(from);
    return tasks.filter((task) => hasAll(quals, task.qualifications));
  }

  /**
   * Get tasks that can be done by a given number of people.
   * @param from State or array of tasks to search.
   * @param people Number of people to accommodate.
   * @returns Array of tasks that can be done by the specified number of people.
   */
  static getByCapacity(from: State | Task[], people: number): Task[] {
    const tasks = Task.getAll(from);
    return tasks.filter((task) => {
      const { min, max } = task;
      return people >= min.people && people <= max.people;
    });
  }

  /**
   * Get tasks that meet a predicate.
   * @param from A state or array of tasks to search.
   * @param filter Predicate function to filter tasks.
   * @returns Array of tasks that meet the predicate.
   */
  static getBy(from: State | Task[], filter: (task: Task) => boolean): Task[] {
    return Task.getAll(from).filter(filter);
  }

  /**
   * Create a new task from a JSON object.
   * @param json JSON object representing a task.
   * @param state State to bind the task to.
   * @returns new Task
   */
  static fromJSON(json: JsonValue, state?: State): Task {
    const { qualifications, _min, _max, uuid } = json as JsonObject;
    const min = _min ? (_min as JsonObject) : { people: 0 };
    const max = _max ? (_max as JsonObject) : { people: Infinity };

    return new Task(
      {
        ...displayFromJSON(json),
        qualifications: revivedArr(Qualification, qualifications, state),
        min: { people: (min?.people as number) || 0 },
        max: { people: (max?.people as number) || Infinity },
      },
      state,
      typeof uuid === "string" ? uuid : undefined,
    );
  }

  /**
   * Serialize the task to a JSON value.
   * @returns JSON value representing the task.
   */
  toJSON(): JsonObject {
    const ans: JsonObject = {
      uuid: this.uuid,
      ...displayToJSON(this),
      qualifications: this.qualifications.map((ql) => ql.toJSON()),
      min: {
        people: this.min.people,
      },
      max: {
        people: this.max.people === Infinity ? null : this.max.people,
      },
    };

    return ans;
  }

  /**
   * Create a deep copy of the task.
   * @returns new Task with the same properties as the original.
   */
  copy(): Task {
    return new Task(
      {
        name: this.name,
        description: this.description,
        icon: this.icon?.copy(),
        qualifications: copyArr(this.qualifications),
      },
      this.state,
      this.uuid,
    );
  }

  /**
   * Write this Task and its required qualifications to the state
   */
  put() {
    if (this.state) {
      this.state.put(this);
      this._qualifications.forEach((ql) => (ql.state = this.state));
      this._qualifications.forEach((ql) => ql.put());
    }
  }

  /**
   * Add a qualification to the task.
   * @param qualification Qualification to add
   */
  addQualification(qualification: Qualification): void {
    if (!has(this._qualifications, qualification)) {
      this._qualifications.push(qualification);
    }
  }

  /**
   * Remove a qualification from the task.
   * @param qualification Qualification to remove
   */
  removeQualification(qualification: Qualification): void {
    if (has(this._qualifications, qualification)) {
      this._qualifications = without(this._qualifications, qualification);
    }
  }

  /**
   * Search the bound state for assignments for this task. If no state is bound, this method will return an empty array.
   * @returns Array of assignments for this task.
   */
  getAssignments(): Assignment[] {
    if (!this.state) {
      return [];
    }
    console.error(
      "GranularAssignment not implemented yet, so it is impossible to get assignments for a task.",
    );
    return []; // TODO: Implement this once GranularAssignment is implemented
  }

  /**
   * Get the qualifications required for the task.
   */
  get qualifications(): Qualification[] {
    let ans = this._qualifications;
    if (this.state) {
      ans = this._qualifications
        .map((s) => s.get())
        .filter((s) => s !== undefined) as Qualification[];
    }
    return copyArr(ans);
  }

  /**
   * Set the qualifications required for the task.
   */
  set qualifications(qs: Qualification[]) {
    this._qualifications = copyArr(qs);
  }
}
