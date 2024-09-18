import { get } from "svelte/store";
import type { JsonObject, JsonValue, PartialDeep } from "type-fest";
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

interface ITask {
  name: string;
  description: string;
  skills: Skill[];
  min: TaskMinMax;
  max: TaskMinMax;
}

export class Task extends Base implements ITask {
  private _name: string;
  private _description: string;
  private _skills: Skill[] = [];
  private _min: TaskMinMax;
  private _max: TaskMinMax;

  constructor(props: PartialDeep<ITask>, state?: State, uuid?: string) {
    super(state, uuid);
    this._name = props.name || "";
    this._description = props.description || "";
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
      return get(from.tasks).get(uuid)?.copy();
    }
    return from.find((task) => task.uuid === uuid)?.copy();
  }

  static getAll(from: State | Task[]): Task[] {
    if (from instanceof State) {
      return copyArr(Array.from(get(from.tasks).values()));
    }
    return copyArr(from);
  }

  static getRequiring(from: State | Task[], ...args: WithArg[]): Task[] {
    let tasks = Task.getAll(from);
    for (const arg of args) {
      if (arg instanceof Skill) {
        tasks = tasks.filter((task) => has(task.skills, arg));
      } else {
        tasks = tasks.filter((task) => hasAll(task.skills, arg));
      }
    }
    return tasks;
  }

  static getSuitable(from: State | Task[], target: Skill | Skill[] | Person) {
    const skills =
      target instanceof Person ? target.skills : target instanceof Skill ? [target] : target;
    const tasks = Task.getAll(from);
    return tasks.filter((task) => hasAll(skills, task.skills));
  }

  static getByCapacity(from: State | Task[], min?: number, max?: number): Task[] {
    const tasks = Task.getAll(from);
    return tasks.filter((task) => {
      const { people } = task.min;
      return (min === undefined || people >= min) && (max === undefined || people <= max);
    });
  }

  static getBy(from: State | Task[], filter: (task: Task) => boolean): Task[] {
    return Task.getAll(from).filter(filter);
  }

  static fromJSON(json: JsonValue, state?: State): Task {
    const { name, description, skills, uuid, min: _min, max: _max } = json as JsonObject;
    const min = _min as { people?: number };
    const max = _max as { people?: number };

    return new Task(
      {
        name: typeof name === "string" ? name : undefined,
        description: typeof description === "string" ? description : undefined,
        skills: revivedArr(Skill, skills, state),
        min,
        max
      },
      state,
      typeof uuid === "string" ? uuid : undefined
    );
  }

  toJSON(): JsonValue {
    const ans: JsonObject = {
      uuid: this.uuid,
      name: this._name,
      description: this._description,
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

  dependencies(): Base[] {
    return this._skills;
  }

  removeDependency(dep: Base): void {
    if (dep instanceof Skill) {
      this.removeSkill(dep);
    }
  }

  copy(): Task {
    return new Task(
      {
        name: this._name,
        description: this._description,
        skills: copyArr(this._skills)
      },
      this._state,
      this.uuid
    );
  }

  update(force: boolean = false): boolean {
    if (super.update(force)) {
      const task = this.get() as Task;
      this._name = task._name;
      this._description = task._description;
      this._skills = task._skills;
      return true;
    }
    return false;
  }

  addSkill(skill: Skill): void {
    if (!has(this._skills, skill)) {
      this._skills.push(skill);
      this.touch();
    }
  }

  removeSkill(skill: Skill): void {
    if (has(this._skills, skill)) {
      this._skills = without(this._skills, skill);
      this.touch();
    }
  }

  getAssignments(): Assignment[] {
    if (!this._state) {
      return [];
    }
    return Assignment.getWith(this._state, this);
  }

  get name(): string {
    this.update();
    return this._name;
  }

  get description(): string {
    this.update();
    return this._description;
  }

  get skills(): Skill[] {
    this.update();
    return this._skills;
  }

  get min(): { people: number } {
    return this._min;
  }

  get max(): { people: number } {
    return {
      people: this._max?.people || Infinity
    };
  }

  set name(name: string) {
    this._name = name;
    this.touch();
  }

  set description(description: string) {
    this._description = description;
    this.touch();
  }

  set skills(skills: Skill[]) {
    this._skills = copyArr(skills);
    this.touch();
  }

  set min(min: Partial<TaskMinMax>) {
    this._min.people = min.people || 0;
    this.touch();
  }

  set max(max: Partial<TaskMinMax>) {
    this._max.people = max.people || Infinity;
    this.touch();
  }
}
