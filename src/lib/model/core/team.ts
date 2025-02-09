import { Icon, type Display } from "$lib/ui";
import { copyArr } from "$lib/utils";
import { get } from "svelte/store";
import type { JsonObject, JsonValue } from "type-fest";
import { Base } from "./base";
import { displayFromJSON, displayToJSON } from "./misc";
import { Person } from "./person";
import { State } from "./state";

/**
 * Represents a team that a person can be a part of.
 * @interface
 * @property {string} name - The name of the team.
 * @property {string} description - A description of the team.
 * @property {Icon} icon - The icon representing the team.
 * @see Icon
 */
type ITeam = Display;

/**
 * Represents a team that a person can be a part of.
 */
export class Team extends Base implements ITeam {
  name: string;
  description?: string;
  icon?: Icon;

  /**
   * Creates a new team.
   * @param props Properties of the team.
   * @param state State to bind the team to.
   * @param uuid UUID of the team. If not provided, a new UUID is generated
   * @see ITeam
   */
  constructor(props: Partial<Team>, state?: State, uuid?: string) {
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
  static get(from: State | Team[], uuid: string): Team | undefined {
    if (from instanceof State) {
      return get(from._teams).get(uuid)?.copy();
    }
    return from.find((ql) => ql.uuid === uuid)?.copy();
  }

  /**
   * Get all qualifications from a State.
   * @param from State to get all qualifications from.
   * @returns Array of qualifications.
   */
  static getAll(from: State | Team[]): Team[] {
    if (from instanceof State) {
      return copyArr(Array.from(get(from._teams).values()));
    }
    return copyArr(from);
  }

  /**
   * Get all qualifications that satisfy a filter function from a State.
   * @param from State or array of qualifications to search.
   * @param filter Predicate function to filter qualifications.
   * @returns Array of qualifications that satisfy the filter.
   */
  static getBy(from: State | Team[], filterFn: (team: Team) => boolean): Team[] {
    return this.getAll(from).filter(filterFn);
  }

  /**
   * Deserialize a JSON object into a qualification.
   * @param json JSON object to deserialize.
   * @param state State to bind the qualification to.
   * @returns new qualification
   */
  static fromJSON(json: JsonValue, state?: State): Team {
    const { uuid } = json as JsonObject;
    return new Team(
      {
        ...displayFromJSON(json),
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
      ...displayToJSON(this),
    };
  }

  /**
   * Copy the qualification.
   * @returns new qualification
   */
  copy(): Team {
    return new Team(
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
   * Get all people who are part of this team.
   * Note: this queries the state for people with this qualification. If no state is bound, this method will return an empty array.
   * @returns Array of people with this qualification.
   */
  getPeople(): Person[] {
    if (!this.state) {
      return [];
    }
    return Person.getBy(this.state, (person) => person.team?.eq(this) ?? false);
  }
}
