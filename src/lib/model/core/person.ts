import type { Display } from "$lib/ui";
import { copyArr, has, misc, without } from "$lib/utils";
import { CalendarDate, getLocalTimeZone, now, parseDate } from "@internationalized/date";
import { get } from "svelte/store";
import type { JsonObject, JsonValue } from "type-fest";
import { fullYearsBetween } from "../temporal/utils";
import { Assignment } from "./assignment";
import { Base } from "./base";
import { displayFromJSON, displayToJSON, revivedArr } from "./misc";
import { Qualification } from "./qualification";
import { State } from "./state";

/**
 * Represents a member of an organisation who can be assigned to tasks.
 * @interface
 * @property {string} name - The name of the person.
 * @property {Qualification[]} qualifications - The qualifications that the person has.
 * @property {string} role - The job title of the person.
 * @property {URL} [avatar] - The URL of the person's avatar.
 * @property {CalendarDate} [birthday] - The person's birthday.
 * @see Qualification
 * @see CalendarDate
 * @see URL
 */
interface IPerson extends Display {
  qualifications: Qualification[];
  role: string;
  birthday?: CalendarDate;
}

/**
 * Represents a member of an organisation who can be assigned to tasks.
 */
export class Person extends Base implements IPerson {
  name: string;
  description?: string;
  avatar?: URL;
  role: string;
  birthday?: CalendarDate;
  private _qualifications: Qualification[];

  /**
   * A member of an organisation who can be assigned to tasks.
   * @param props Properties of the person.
   * @param state State to bind the person to.
   * @param uuid UUID of the person. If not provided, a new UUID is generated.
   * @see IPerson
   */
  constructor(props: Partial<IPerson>, state?: State, uuid?: string) {
    super(state, uuid);
    this.name = props.name || "";
    this.description = props.description || "";
    this.avatar = props.avatar;
    this.role = props.role || "";
    this.birthday = props.birthday;
    this._qualifications = props.qualifications || [];
  }

  /**
   * Get a person by UUID from a state or array of people
   * @param from State or array of people to search.
   * @param uuid UUID of the person to get.
   * @returns Person with the specified UUID, or undefined if not found.
   */
  static get(from: State | Person[], uuid: string): Person | undefined {
    if (from instanceof State) {
      return get(from._people).get(uuid)?.copy();
    }
    return from.find((person) => person.uuid === uuid)?.copy();
  }

  /**
   * Get all people from a state
   * @param from State to get all people from.
   * @returns Array of people.
   */
  static getAll(from: State | Person[]): Person[] {
    if (from instanceof State) {
      return copyArr(Array.from(get(from._people).values()));
    }
    return copyArr(from);
  }

  /**
   * Get all people with a specific set of qualifications from a state
   * @param from State or array of people to search.
   * @param qualification Qualification or array of qualifications to search for.
   * @returns Array of people with the specified qualifications.
   */
  static getWith(from: State | Person[], qualification: Qualification | Qualification[]): Person[] {
    const all = this.getAll(from);
    const qualifications = Array.isArray(qualification) ? qualification : [qualification];
    return all.filter((person) =>
      qualifications.every((qualification) => has(person.qualifications, qualification)),
    );
  }

  /**
   * Get all people that satisfy a filter function from a state
   * @param from State or array of people to search.
   * @param filter Predicate function to filter people.
   * @returns Array of people that satisfy the filter.
   */
  static getBy(from: State | Person[], filter: (person: Person) => boolean): Person[] {
    return this.getAll(from).filter(filter);
  }

  /**
   * Create a new person from a JSON value
   * @param json JSON value to create the person from.
   * @param state State to revive references and bind the person to.
   * @returns new Person, bound to the state if provided.
   */
  static fromJSON(json: JsonValue, state?: State): Person {
    const { uuid, qualifications, role, birthday } = json as JsonObject;
    return new Person(
      {
        ...displayFromJSON(json),
        qualifications: revivedArr(Qualification, qualifications, state),
        role: role as string,
        birthday: birthday ? parseDate(birthday as string) : undefined,
      },
      state,
      typeof uuid === "string" ? uuid : undefined,
    );
  }

  /**
   * Serialize the person to a JSON value
   * @returns JSON value representing the person.
   */
  toJSON(): JsonObject {
    const ans: JsonObject = {
      uuid: this.uuid,
      ...displayToJSON(this),
      qualifications: this.qualifications.map((qualification) => qualification.toJSON()),
      role: this.role,
    };

    if (this.birthday) {
      ans.birthday = this.birthday.toString();
    }

    console.log("Serialized Person: ", ans);
    return ans;
  }

  /**
   * Create a new person with the same properties as the original.
   * @returns new Person with the same properties as the original.
   */
  copy(): Person {
    return new Person(
      {
        name: this.name,
        description: this.description,
        role: this.role,
        qualifications: copyArr(this.qualifications),
        avatar: this.avatar ? new URL(this.avatar.href) : undefined,
        birthday: this.birthday?.copy(),
      },
      this.state,
      this.uuid,
    );
  }

  /**
   * Write this Person and their qualifications to the state
   */
  put() {
    if (this.state) {
      this.state.put(this);
      this._qualifications.forEach((qualification) => qualification.put());
    }
  }

  /**
   * Add a qualification to the person
   * @param qualification qualification to add to the person.
   */
  addQualification(qualification: Qualification): void {
    if (!has(this.qualifications, qualification)) {
      this._qualifications.push(qualification);
    }
  }

  /**
   * Remove a qualification from the person, if they have it
   * @param qualification qualification to remove from the person.
   */
  removeQualification(qualification: Qualification): void {
    if (has(this.qualifications, qualification)) {
      this.qualifications = without(this.qualifications, qualification);
    }
  }

  /**
   * Get all assignments for the person from the state
   * @returns Array of assignments for the person.
   * Note: This looks up assignments from the Person's bound state. If the Person is not bound to a state, this will return an empty array.
   */
  getAssignments(): Assignment[] {
    if (!this.state) {
      return [];
    }
    return Assignment.getForPerson(this.state, this);
  }

  /**
   * Get the person's qualifications
   */
  get qualifications(): Qualification[] {
    if (!this.state) {
      return copyArr(this._qualifications);
    }
    return this._qualifications
      .map((s) => s.get())
      .filter((s) => s !== undefined) as Qualification[];
  }

  /**
   * Set the person's qualifications
   */
  set qualifications(qs: Qualification[]) {
    this._qualifications = copyArr(qs);
  }

  /**
   * Get the initials of the person's name
   */
  get initials(): string {
    return misc.getInitials(this.name);
  }

  /**
   * Get the person's age
   * @returns The person's age in years, or undefined if the birthday is not set.
   */
  get age(): number | undefined {
    if (!this.birthday) {
      return undefined;
    }
    return fullYearsBetween(this.birthday, now(getLocalTimeZone()));
  }
}
