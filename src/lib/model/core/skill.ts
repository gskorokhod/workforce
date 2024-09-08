import { get } from "svelte/store";
import type { JsonObject, JsonValue } from "type-fest";
import { Icon } from "../ui";
import { has } from "../utils";
import { Base } from "./base";
import type { State } from "./state";
import type { Task } from "./task";
import type { Person } from "./person";

const DEF_ICON = new Icon({
  pack: "lucide",
  name: "briefcase-business"
});

interface ISkill {
  name: string;
  description: string;
  icon: Icon;
}

export class Skill extends Base implements ISkill {
  private _name: string;
  private _description: string;
  private _icon: Icon;

  constructor(props: Partial<ISkill>, state?: State, uuid?: string) {
    super(state, uuid);
    this._name = props.name || "";
    this._description = props.description || "";
    this._icon = props.icon || DEF_ICON.copy();
  }

  static fromJSON(json: JsonValue, state?: State): Skill {
    const { name, description, icon, uuid } = json as JsonObject;

    return new Skill(
      {
        name: typeof name === "string" ? name : "",
        description: typeof description === "string" ? description : "",
        icon: Icon.fromJSON(icon as JsonObject) || DEF_ICON.copy()
      },
      state,
      typeof uuid === "string" ? uuid : undefined
    );
  }

  toJSON(): JsonObject {
    return {
      uuid: this.uuid,
      name: this._name,
      description: this._description,
      icon: this._icon.toJSON()
    };
  }

  dependencies(): Base[] {
    return [];
  }

  removeDependency(): void {}

  copy(): Skill {
    return new Skill(
      {
        name: this._name,
        description: this._description,
        icon: this._icon.copy()
      },
      this.state,
      this.uuid
    );
  }

  update(force: boolean = false): boolean {
    if (super.update(force)) {
      const skill = this.get() as Skill;
      this._name = skill._name;
      this._description = skill._description;
      this._icon = skill._icon;
      return true;
    }
    return false;
  }

  getTasks(): Task[] {
    if (!this.state) {
      return [];
    }

    const tasks = [];
    for (const task of get(this.state.tasks).values()) {
      if (has(task.skills, this)) {
        tasks.push(task.copy());
      }
    }
    return tasks;
  }

  getPeople(): Person[] {
    if (!this.state) {
      return [];
    }

    const people = [];
    for (const person of get(this.state.people).values()) {
      if (has(person.skills, this)) {
        people.push(person.copy());
      }
    }
    return people;
  }

  get name(): string {
    this.update();
    return this._name;
  }

  get description(): string {
    this.update();
    return this._description;
  }

  get icon(): Icon {
    this.update();
    return this._icon;
  }

  set name(name: string) {
    this._name = name;
    this.touch();
  }

  set description(description: string) {
    this._description = description;
    this.touch();
  }

  set icon(icon: Icon) {
    this._icon = icon.copy();
    this.touch();
  }
}
