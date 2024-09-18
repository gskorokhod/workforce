import { get } from "svelte/store";
import type { JsonObject, JsonValue } from "type-fest";
import { Icon } from "../ui";
import { copyArr } from "../utils";
import { Base } from "./base";
import { Person } from "./person";
import { State } from "./state";
import { Task } from "./task";

/**
 * Default icon for a skill.
 */
const DEF_ICON = new Icon({
  pack: "lucide",
  name: "briefcase-business"
});

/**
 * Represents a skill that a person can have.
 * @interface
 * @property {string} name - The name of the skill.
 * @property {string} description - A description of the skill.
 * @property {Icon} icon - The icon representing the skill.
 * @see Icon
 */
interface ISkill {
  name: string;
  description: string;
  icon: Icon;
}

/**
 * Represents a skill (qualification) that a person can have.
 */
export class Skill extends Base implements ISkill {
  private _name: string;
  private _description: string;
  private _icon: Icon;

  /**
   * Creates a new skill.
   * @param props Properties of the skill.
   * @param state State to bind the skill to.
   * @param uuid UUID of the skill. If not provided, a new UUID is generated
   * @see ISkill
   */
  constructor(props: Partial<ISkill>, state?: State, uuid?: string) {
    super(state, uuid);
    this._name = props.name || "";
    this._description = props.description || "";
    this._icon = props.icon || DEF_ICON.copy();
  }

  /**
   * Creates a skill from a JSON object.
   * @param json JSON object to create the skill from.
   * @param state State to bind the skill to.
   * @returns new Skill
   */
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

  /**
   * Get a Skill from a State by UUID.
   * @param from State or array of skills to search.
   * @param uuid UUID of the skill to get.
   * @returns Skill with the specified UUID, or undefined if not found.
   */
  static get(from: State | Skill[], uuid: string): Skill | undefined {
    if (from instanceof State) {
      return get(from.skills).get(uuid)?.copy();
    }
    return from.find((skill) => skill.uuid === uuid)?.copy();
  }

  /**
   * Get all skills from a State.
   * @param from State to get all skills from.
   * @returns Array of skills.
   */
  static getAll(from: State | Skill[]): Skill[] {
    if (from instanceof State) {
      return copyArr(Array.from(get(from.skills).values()));
    }
    return copyArr(from);
  }

  /**
   * Get all skills that satisfy a filter function from a State.
   * @param from State or array of skills to search.
   * @param filter Predicate function to filter skills.
   * @returns Array of skills that satisfy the filter.
   */
  static getBy(from: State | Skill[], filter: (skill: Skill) => boolean): Skill[] {
    return this.getAll(from).filter(filter);
  }

  /**
   * Serialises the skill to a JSON object.
   * @returns JSON representation of the skill.
   */
  toJSON(): JsonObject {
    return {
      uuid: this.uuid,
      name: this._name,
      description: this._description,
      icon: this._icon.toJSON()
    };
  }

  /**
   * Objecs in the state that this skill depends on.
   * @returns Array of objects that this skill depends on. Currently empty because skills do not depend on other objects.
   */
  dependencies(): Base[] {
    return [];
  }

  /**
   * Handle a dependency being removed from the state. Currently does nothing because skills do not depend on other objects.
   */
  removeDependency(): void {}

  /**
   * Create a copy of the skill.
   * @returns a new Skill with the same properties as the original.
   */
  copy(): Skill {
    return new Skill(
      {
        name: this._name,
        description: this._description,
        icon: this._icon.copy()
      },
      this._state,
      this.uuid
    );
  }

  /**
   * Update the skill from the state.
   * @param force If true, local data is overwritten even if it is newer than the state. Default is false.
   * @returns True if the local state has been updated, false otherwise.
   */
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

  /**
   * Get all tasks that require this skill from the state.
   * Note: this queries the state for tasks that require this skill. If no state is bound, this method will return an empty array.
   * @returns Array of tasks that require this skill.
   */
  getTasks(): Task[] {
    if (!this._state) {
      return [];
    }
    return Task.getRequiring(this._state, this);
  }

  /**
   * Get all people with this skill from the state.
   * Note: this queries the state for people with this skill. If no state is bound, this method will return an empty array.
   * @returns Array of people with this skill.
   */
  getPeople(): Person[] {
    if (!this._state) {
      return [];
    }
    return Person.getWith(this._state, this);
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
