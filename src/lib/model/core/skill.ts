import { get } from "svelte/store";
import type { JsonObject, JsonValue } from "type-fest";
import { Icon, type Display } from "../ui";
import { copyArr } from "../utils";
import { Base } from "./base";
import { Person } from "./person";
import { State } from "./state";
import { Task } from "./task";

/**
 * Represents a skill that a person can have.
 * @interface
 * @property {string} name - The name of the skill.
 * @property {string} description - A description of the skill.
 * @property {Icon} icon - The icon representing the skill.
 * @see Icon
 */
type ISkill = Display;

/**
 * Represents a skill (qualification) that a person can have.
 */
export class Skill extends Base implements ISkill {
  name: string;
  description?: string;
  icon?: Icon;

  /**
   * Creates a new skill.
   * @param props Properties of the skill.
   * @param state State to bind the skill to.
   * @param uuid UUID of the skill. If not provided, a new UUID is generated
   * @see ISkill
   */
  constructor(props: Partial<ISkill>, state?: State, uuid?: string) {
    super(state, uuid);
    this.name = props.name || "";
    this.description = props.description || "";
    this.icon = props.icon;
  }

  /**
   * Get a Skill from a State by UUID.
   * @param from State or array of skills to search.
   * @param uuid UUID of the skill to get.
   * @returns Skill with the specified UUID, or undefined if not found.
   */
  static get(from: State | Skill[], uuid: string): Skill | undefined {
    if (from instanceof State) {
      return get(from._skills).get(uuid)?.copy();
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
      return copyArr(Array.from(get(from._skills).values()));
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
   * Deserialize a JSON object into a Skill.
   * @param json JSON object to deserialize.
   * @param state State to bind the skill to.
   * @returns new Skill
   */
  static fromJSON(json: JsonValue, state?: State): Skill {
    const { name, description, icon, uuid } = json as JsonObject;
    return new Skill(
      {
        name: name as string,
        description: description as string,
        icon: icon ? Icon.fromJSON(icon as JsonObject) : undefined
      },
      state,
      typeof uuid === "string" ? uuid : undefined
    );
  }

  /**
   * Serialize the skill to a JSON object.
   * @returns JSON object
   */
  toJSON(): JsonObject {
    return {
      uuid: this.uuid,
      name: this.name,
      description: this.description || "",
      icon: this.icon?.toJSON() || null
    };
  }

  /**
   * Copy the skill.
   * @returns new Skill
   */
  copy(): Skill {
    return new Skill(
      {
        name: this.name,
        description: this.description,
        icon: this.icon?.copy()
      },
      this.state,
      this.uuid
    );
  }

  /**
   * Get all tasks that require this skill from the state.
   * Note: this queries the state for tasks that require this skill. If no state is bound, this method will return an empty array.
   * @returns Array of tasks that require this skill.
   */
  getTasks(): Task[] {
    if (!this.state) {
      return [];
    }
    return Task.getRequiring(this.state, this);
  }

  /**
   * Get all people with this skill from the state.
   * Note: this queries the state for people with this skill. If no state is bound, this method will return an empty array.
   * @returns Array of people with this skill.
   */
  getPeople(): Person[] {
    if (!this.state) {
      return [];
    }
    return Person.getWith(this.state, this);
  }
}
