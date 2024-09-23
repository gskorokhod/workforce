import { get } from "svelte/store";
import type { JsonObject, JsonValue } from "type-fest";
import { Icon, type Display } from "../ui";
import { copyArr, has, hasAll, without } from "../utils";
import { Assignment } from "./assignment";
import { Base } from "./base";
import { revivedArr } from "./misc";
import { Person } from "./person";
import { Skill } from "./skill";
import { State } from "./state";

type WithArg = Skill | Skill[];

interface TaskMinMax {
  people: number;
}

interface ITask extends Display {
  skills: Skill[];
  min: TaskMinMax;
  max: TaskMinMax;
}

export class Task extends Base implements ITask {
  private _name: string;
  private _description?: string;
  private _icon?: Icon;
  private _skills: Skill[] = [];
  private _min: TaskMinMax;
  private _max: TaskMinMax;

  constructor(props: Partial<ITask>, state?: State, uuid?: string) {
    super(state, uuid);
    this._name = props.name || "";
    this._description = props.description || "";
    this._icon = props.icon;
    this.skills = props.skills || [];
    this._min = { people: props.min?.people || 0 };
    this._max = { people: props.max?.people || Infinity };
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
   * Get all tasks that require a set of skills.
   *
   * @param from A state or array of tasks to search.
   * @param args Each argument is a skill or an array of skills. An argument matches if the task requires all the skills in the argument. If multiple arguments are provided, all tasks that match at least one argument are returned. (See examples)
   * @returns Array of tasks that require the specified skills.
   *
   * @example `Task.getRequiring(state, skill1, skill2)` - Returns tasks that require `skill1` or `skill2`
   * @example `Task.getRequiring(state, [skill1, skill2])` - Returns tasks that require both `skill1` and `skill2`
   * @example `Task.getRequiring(state, skill1, [skill2, skill3])` - Returns tasks that require either `skill1` or both `skill2` and `skill3`
   */
  static getRequiring(from: State | Task[], ...args: WithArg[]): Task[] {
    const tasks = Task.getAll(from);
    const ans: Task[] = [];

    for (const arg of args) {
      let filtered: Task[] = [];

      if (arg instanceof Skill) {
        filtered = tasks.filter((task) => has(task.skills, arg));
      } else {
        filtered = tasks.filter((task) => hasAll(task.skills, arg));
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
   * Get tasks that can be done by a person with a given set of skills.
   * @param from State or array of tasks to search.
   * @param target `Person` object representing the candidate, or an array of `Skill` objects.
   * @returns Array of tasks that can be done by a person with the specified skills.
   */
  static getSuitable(from: State | Task[], target: Skill[] | Person) {
    const skills = target instanceof Person ? target.skills : target;
    const tasks = Task.getAll(from);
    return tasks.filter((task) => hasAll(skills, task.skills));
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
    const { name, description, icon, skills, _min, _max, uuid } = json as JsonObject;
    const min = _min ? (_min as JsonObject) : { people: 0 };
    const max = _max ? (_max as JsonObject) : { people: Infinity };

    return new Task(
      {
        name: name as string,
        description: description as string,
        icon: icon ? Icon.fromJSON(icon as JsonObject) : undefined,
        skills: revivedArr(Skill, skills, state),
        min: { people: (min?.people as number) || 0 },
        max: { people: (max?.people as number) || Infinity }
      },
      state,
      typeof uuid === "string" ? uuid : undefined
    );
  }

  /**
   * Serialize the task to a JSON value.
   * @returns JSON value representing the task.
   */
  toJSON(): JsonValue {
    const ans: JsonObject = {
      name: this._name,
      description: this._description || "",
      icon: this._icon?.toJSON() || null,
      skills: this._skills.map((skill) => skill.toJSON()),
      min: {
        people: this._min.people
      },
      max: {
        people: this._max.people === Infinity ? null : this._max.people
      }
    };

    return ans;
  }

  /**
   * Get the objects in the state that this task depends on.
   * @returns Array of dependencies.
   */
  dependencies(): Base[] {
    return this._skills;
  }

  /**
   * Handle a dependency being removed from the state.
   * @param dep Dependency to remove
   */
  removeDependency(dep: Base): void {
    if (dep instanceof Skill) {
      this.removeSkill(dep);
    }
  }

  /**
   * Create a deep copy of the task.
   * @returns new Task with the same properties as the original.
   */
  copy(): Task {
    return new Task(
      {
        name: this._name,
        description: this._description,
        icon: this._icon?.copy(),
        skills: copyArr(this._skills)
      },
      this._state,
      this.uuid
    );
  }

  /**
   * Update the task with the current value from the state.
   * @param force If true, local data is overwritten even if it is newer than the state. Default is false.
   * @returns True if local state has been updated, false otherwise. If the object is not bound to a state or doesn't exist there, always returns false.
   */
  update(force: boolean = false): boolean {
    if (super.update(force)) {
      const task = this.get() as Task;
      this._name = task._name;
      this._description = task._description;
      this._icon = task._icon;
      this._skills = task._skills;
      this._min = task._min;
      this._max = task._max;
      return true;
    }
    return false;
  }

  /**
   * Add a skill to the task.
   * @param skill Skill to add
   */
  addSkill(skill: Skill): void {
    if (!has(this._skills, skill)) {
      this._skills.push(skill);
      this.touch();
    }
  }

  /**
   * Remove a skill from the task.
   * @param skill Skill to remove
   */
  removeSkill(skill: Skill): void {
    if (has(this._skills, skill)) {
      this._skills = without(this._skills, skill);
      this.touch();
    }
  }

  /**
   * Search the bound state for assignments for this task. If no state is bound, this method will return an empty array.
   * @returns Array of assignments for this task.
   */
  getAssignments(): Assignment[] {
    if (!this._state) {
      return [];
    }
    return Assignment.getWith(this._state, this);
  }

  /**
   * Get the name of the task.
   */
  get name(): string {
    this.update();
    return this._name;
  }

  /**
   * Get the description of the task.
   */
  get description(): string {
    this.update();
    return this._description || "";
  }

  /**
   * Get the icon of the task.
   */
  get icon(): Icon | undefined {
    this.update();
    return this._icon;
  }

  /**
   * Get the skills required for the task.
   */
  get skills(): Skill[] {
    this.update();
    return this._skills;
  }

  /**
   * Get the minimum number of people that can be assigned to the task.
   */
  get min(): { people: number } {
    return this._min;
  }

  /**
   * Get the maximum number of people that can be assigned to the task.
   */
  get max(): { people: number } {
    return {
      people: this._max?.people || Infinity
    };
  }

  /**
   * Set the skills required for the task.
   */
  set skills(skills: Skill[]) {
    this._skills = copyArr(skills);
    this.touch();
  }

  /**
   * Set the minimum number of people that can be assigned to the task.
   */
  set min(min: Partial<TaskMinMax>) {
    this._min.people = min.people || 0;
    this.touch();
  }

  /**
   * Set the maximum number of people that can be assigned to the task.
   */
  set max(max: Partial<TaskMinMax>) {
    this._max.people = max.people || Infinity;
    this.touch();
  }

  /**
   * Set the name of the task.
   */
  set name(name: string) {
    this._name = name;
    this.touch();
  }

  /**
   * Set the description of the task.
   */
  set description(description: string) {
    this._description = description;
    this.touch();
  }

  /**
   * Set the icon of the task.
   */
  set icon(icon: Icon | undefined) {
    this._icon = icon;
    this.touch();
  }
}
