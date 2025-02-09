import { Icon, type Display } from "$lib/ui";
import { copyArr } from "$lib/utils";
import { get } from "svelte/store";
import type { JsonObject, JsonValue } from "type-fest";
import { Base } from "./base";
import { Person } from "./person";
import { State } from "./state";
import { Task } from "./task";

/**
 * Represents a qualification that a person can have.
 * @interface
 * @property {string} name - The name of the qualification.
 * @property {string} description - A description of the qualification.
 * @property {Icon} icon - The icon representing the qualification.
 * @see Icon
 */
type IQualification = Display;

/**
 * Represents a qualification (qualification) that a person can have.
 */
export class Qualification extends Base implements IQualification {
  name: string;
  description?: string;
  icon?: Icon;

  /**
   * Creates a new qualification.
   * @param props Properties of the qualification.
   * @param state State to bind the qualification to.
   * @param uuid UUID of the qualification. If not provided, a new UUID is generated
   * @see IQualification
   */
  constructor(props: Partial<IQualification>, state?: State, uuid?: string) {
    super(state, uuid);
    this.name = props.name || "";
    this.description = props.description;
    this.icon = props.icon;
  }

  /**
   * Get a qualification from a State by UUID.
   * @param from State or array of qualifications to search.
   * @param uuid UUID of the qualification to get.
   * @returns qualification with the specified UUID, or undefined if not found.
   */
  static get(from: State | Qualification[], uuid: string): Qualification | undefined {
    if (from instanceof State) {
      return get(from._qualifications).get(uuid)?.copy();
    }
    return from.find((ql) => ql.uuid === uuid)?.copy();
  }

  /**
   * Get all qualifications from a State.
   * @param from State to get all qualifications from.
   * @returns Array of qualifications.
   */
  static getAll(from: State | Qualification[]): Qualification[] {
    if (from instanceof State) {
      return copyArr(Array.from(get(from._qualifications).values()));
    }
    return copyArr(from);
  }

  /**
   * Get all qualifications that satisfy a filter function from a State.
   * @param from State or array of qualifications to search.
   * @param filter Predicate function to filter qualifications.
   * @returns Array of qualifications that satisfy the filter.
   */
  static getBy(
    from: State | Qualification[],
    filter: (ql: Qualification) => boolean,
  ): Qualification[] {
    return this.getAll(from).filter(filter);
  }

  /**
   * Deserialize a JSON object into a qualification.
   * @param json JSON object to deserialize.
   * @param state State to bind the qualification to.
   * @returns new qualification
   */
  static fromJSON(json: JsonValue, state?: State): Qualification {
    const { name, description, icon, uuid } = json as JsonObject;
    return new Qualification(
      {
        name: name as string,
        description: description as string,
        icon: icon ? Icon.fromJSON(icon as JsonObject) : undefined,
      },
      state,
      typeof uuid === "string" ? uuid : undefined,
    );
  }

  /**
   * Serialize the qualification to a JSON object.
   * @returns JSON object
   */
  toJSON(): JsonObject {
    return {
      uuid: this.uuid,
      name: this.name,
      description: this.description || "",
      icon: this.icon?.toJSON() || null,
    };
  }

  /**
   * Copy the qualification.
   * @returns new qualification
   */
  copy(): Qualification {
    return new Qualification(
      {
        name: this.name,
        description: this.description,
        icon: this.icon?.copy(),
      },
      this.state,
      this.uuid,
    );
  }

  /**
   * Get all tasks that require this qualification from the state.
   * Note: this queries the state for tasks that require this qualification. If no state is bound, this method will return an empty array.
   * @returns Array of tasks that require this qualification.
   */
  getTasks(): Task[] {
    if (!this.state) {
      return [];
    }
    return Task.getRequiring(this.state, this);
  }

  /**
   * Get all people with this qualification from the state.
   * Note: this queries the state for people with this qualification. If no state is bound, this method will return an empty array.
   * @returns Array of people with this qualification.
   */
  getPeople(): Person[] {
    if (!this.state) {
      return [];
    }
    return Person.getWith(this.state, this);
  }
}
