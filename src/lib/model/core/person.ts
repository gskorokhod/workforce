import type { Display } from "$lib/ui";
import { copyArr, has, misc, without } from "$lib/utils";
import { CalendarDate, getLocalTimeZone, now, parseDate } from "@internationalized/date";
import { get } from "svelte/store";
import type { JsonObject, JsonValue } from "type-fest";
import { fullYearsBetween } from "../temporal/utils";
import { Assignment } from "./assignment/assignment";
import { Base } from "./base";
import { revivedArr } from "./misc";
import { Skill } from "./skill";
import { State } from "./state";

/**
 * Represents a member of an organisation who can be assigned to tasks.
 * @interface
 * @property {string} name - The name of the person.
 * @property {Skill[]} skills - The skills that the person has.
 * @property {string} job - The job title of the person.
 * @property {URL} [avatar] - The URL of the person's avatar.
 * @property {CalendarDate} [birthday] - The person's birthday.
 * @see Skill
 * @see CalendarDate
 * @see URL
 */
interface IPerson extends Display {
  skills: Skill[];
  job: string;
  birthday?: CalendarDate;
}

/**
 * Represents a member of an organisation who can be assigned to tasks.
 */
export class Person extends Base implements IPerson {
  name: string;
  description?: string;
  avatar?: URL;
  job: string;
  birthday?: CalendarDate;
  private _skills: Skill[];

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
    this.job = props.job || "";
    this.birthday = props.birthday;
    this._skills = props.skills || [];
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
   * Get all people with a specific set of skills from a state
   * @param from State or array of people to search.
   * @param skill Skill or array of skills to search for.
   * @returns Array of people with the specified skills.
   */
  static getWith(from: State | Person[], skill: Skill | Skill[]): Person[] {
    const all = this.getAll(from);
    const skills = Array.isArray(skill) ? skill : [skill];
    return all.filter((person) => skills.every((skill) => has(person.skills, skill)));
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
    const { uuid, name, description, avatar, skills, job, birthday } = json as JsonObject;
    return new Person(
      {
        name: name as string,
        description: description as string,
        avatar: avatar ? new URL(avatar as string) : undefined,
        skills: revivedArr(Skill, skills, state),
        job: job as string,
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
      name: this.name,
      description: this.description || "",
      avatar: this.avatar?.href || null,
      skills: this.skills.map((skill) => skill.toJSON()),
      job: this.job,
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
        job: this.job,
        skills: copyArr(this.skills),
        avatar: this.avatar ? new URL(this.avatar.href) : undefined,
        birthday: this.birthday?.copy(),
      },
      this.state,
      this.uuid,
    );
  }

  /**
   * Write this Person and their skills to the state
   */
  put() {
    if (this.state) {
      this.state.put(this);
      this._skills.forEach((skill) => skill.put());
    }
  }

  /**
   * Add a skill to the person
   * @param skill Skill to add to the person.
   */
  addSkill(skill: Skill): void {
    if (!has(this.skills, skill)) {
      this._skills.push(skill);
    }
  }

  /**
   * Remove a skill from the person, if they have it
   * @param skill Skill to remove from the person.
   */
  removeSkill(skill: Skill): void {
    if (has(this.skills, skill)) {
      this.skills = without(this.skills, skill);
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
   * Get the person's skills
   */
  get skills(): Skill[] {
    if (!this.state) {
      return copyArr(this._skills);
    }
    return this._skills.map((s) => s.get()).filter((s) => s !== undefined) as Skill[];
  }

  /**
   * Set the person's skills
   */
  set skills(skills: Skill[]) {
    this._skills = copyArr(skills);
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
