import { get } from "svelte/store";
import type { JsonObject, JsonValue } from "type-fest";
import { Icon, type Display } from "../ui";
import { copyArr, has, hasAll, without } from "../utils";
import { Assignment } from "./assignment/assignment";
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
  name: string;
  description?: string;
  icon?: Icon;
  min: TaskMinMax;
  max: TaskMinMax;
  private _skills: Skill[] = [];

  constructor(props: Partial<ITask>, state?: State, uuid?: string) {
    super(state, uuid);
    this.name = props.name || "";
    this.description = props.description || "";
    this.icon = props.icon;
    this.min = { people: props.min?.people || 0 };
    this.max = { people: props.max?.people || Infinity };
    this._skills = props.skills || [];
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
  toJSON(): JsonObject {
    const ans: JsonObject = {
      uuid: this.uuid,
      name: this.name,
      description: this.description || "",
      icon: this.icon?.toJSON() || null,
      skills: this.skills.map((skill) => skill.toJSON()),
      min: {
        people: this.min.people
      },
      max: {
        people: this.max.people === Infinity ? null : this.max.people
      }
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
        skills: copyArr(this.skills)
      },
      this.state,
      this.uuid
    );
  }

  /**
   * Write this Task and its required skills to the state
   */
  put() {
    if (this.state) {
      this.state.put(this);
      this._skills.forEach((skill) => (skill.state = this.state));
      this._skills.forEach((skill) => skill.put());
    }
  }

  /**
   * Add a skill to the task.
   * @param skill Skill to add
   */
  addSkill(skill: Skill): void {
    if (!has(this._skills, skill)) {
      this._skills.push(skill);
    }
  }

  /**
   * Remove a skill from the task.
   * @param skill Skill to remove
   */
  removeSkill(skill: Skill): void {
    if (has(this._skills, skill)) {
      this._skills = without(this._skills, skill);
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
    return []; // TODO: Implement this method
  }

  /**
   * Get the skills required for the task.
   */
  get skills(): Skill[] {
    let ans = this._skills;
    if (this.state) {
      ans = this._skills.map((s) => s.get()).filter((s) => s !== undefined) as Skill[];
    }
    return copyArr(ans);
  }

  /**
   * Set the skills required for the task.
   */
  set skills(skills: Skill[]) {
    this._skills = copyArr(skills);
  }
}
