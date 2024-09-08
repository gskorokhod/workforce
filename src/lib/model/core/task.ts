import { get } from "svelte/store";
import type { JsonObject, JsonValue, PartialDeep } from "type-fest";
import { copied, has, without } from "../utils";
import type { Assignment } from "./assignment";
import { Base } from "./base";
import { revivedArr } from "./misc";
import { Skill } from "./skill";
import type { State } from "./state";

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
        skills: copied(this._skills)
      },
      this.state,
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
    if (!this.state) {
      return [];
    }

    const assignments = [];
    for (const assignment of get(this.state.assignments).values()) {
      if (assignment.task?.eq(this)) {
        assignments.push(assignment.copy());
      }
    }
    return assignments;
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
    this._skills = copied(skills);
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
