import { CalendarDate, getLocalTimeZone, now, parseDate } from "@internationalized/date";
import { get } from "svelte/store";
import type { JsonObject, JsonValue } from "type-fest";
import { fullYearsBetween } from "../temporal/utils";
import { copyArr, has, misc, without } from "../utils";
import type { Assignment } from "./assignment";
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
interface IPerson {
  name: string;
  skills: Skill[];
  job: string;
  avatar?: URL;
  birthday?: CalendarDate;
}

/**
 * Represents a member of an organisation who can be assigned to tasks.
 */
export class Person extends Base implements IPerson {
  private _name: string;
  private _skills: Skill[];
  private _job: string;
  private _avatar?: URL;
  private _birthday?: CalendarDate;

  /**
   * A member of an organisation who can be assigned to tasks.
   * @param props Properties of the person.
   * @param state State to bind the person to.
   * @param uuid UUID of the person. If not provided, a new UUID is generated.
   * @see IPerson
   */
  constructor(props: Partial<IPerson>, state?: State, uuid?: string) {
    super(state, uuid);
    this._name = props.name || "";
    this._skills = props.skills || [];
    this._job = props.job || "";
    this._avatar = props.avatar;
    this._birthday = props.birthday;
  }

  /**
   * Get a person by UUID from a state or array of people
   * @param from State or array of people to search.
   * @param uuid UUID of the person to get.
   * @returns Person with the specified UUID, or undefined if not found.
   */
  static get(from: State | Person[], uuid: string): Person | undefined {
    if (from instanceof State) {
      return get(from.people).get(uuid)?.copy();
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
      return copyArr(Array.from(get(from.people).values()));
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
    const { name, skills, job, avatar, birthday, uuid } = json as JsonObject;

    return new Person(
      {
        name: typeof name === "string" ? name : "",
        skills: revivedArr(Skill, skills, state),
        job: typeof job === "string" ? job : "",
        avatar: avatar ? new URL(avatar as string) : undefined,
        birthday: birthday ? parseDate(birthday as string) : undefined
      },
      state,
      typeof uuid === "string" ? uuid : undefined
    );
  }

  /**
   * Serialize the person to a JSON value
   * @returns JSON value representing the person.
   */
  toJSON(): JsonValue {
    const ans: JsonObject = {
      uuid: this.uuid,
      name: this._name,
      skills: this._skills.map((skill) => skill.toJSON()),
      job: this._job
    };

    if (this._avatar) {
      ans.avatar = this._avatar.href;
    }

    if (this._birthday) {
      ans.birthday = this._birthday.toString();
    }

    return ans;
  }

  /**
   * Get all objects in the state that the person depends on.
   * @returns Array of dependencies for the person.
   */
  dependencies(): Base[] {
    return this._skills;
  }

  /**
   * Handle a dependency being removed from the state
   */
  removeDependency(dep: Base): void {
    if (dep instanceof Skill) {
      this.removeSkill(dep);
    }
  }

  /**
   * Create a new person with the same properties as the original.
   * @returns new Person with the same properties as the original.
   */
  copy(): Person {
    return new Person(
      {
        name: this._name,
        skills: copyArr(this._skills),
        job: this._job,
        avatar: this._avatar,
        birthday: this._birthday
      },
      this._state,
      this.uuid
    );
  }

  /**
   * Update the person from the state.
   * @param force If true, local data is overwritten even if it is newer than the state. Default is false.
   * @returns True if the local state has been updated, false otherwise.
   */
  update(force?: boolean): boolean {
    if (super.update(force)) {
      const person = this.get() as Person;
      this._name = person._name;
      this._skills = person._skills;
      this._job = person._job;
      this._avatar = person._avatar;
      this._birthday = person._birthday;
      return true;
    }
    return false;
  }

  /**
   * Add a skill to the person
   * @param skill Skill to add to the person.
   */
  addSkill(skill: Skill): void {
    if (!has(this._skills, skill)) {
      this._skills.push(skill);
      this.touch();
    }
  }

  /**
   * Remove a skill from the person, if they have it
   * @param skill Skill to remove from the person.
   */
  removeSkill(skill: Skill): void {
    if (has(this._skills, skill)) {
      this._skills = without(this._skills, skill);
      this.touch();
    }
  }

  /**
   * Get all assignments for the person from the state
   * @returns Array of assignments for the person.
   * Note: This looks up assignments from the Person's bound state. If the Person is not bound to a state, this will return an empty array.
   */
  getAssignments(): Assignment[] {
    if (!this._state) {
      return [];
    }
    const assignments = [];
    for (const assignment of get(this._state.assignments).values()) {
      if (has(assignment.people, this)) {
        assignments.push(assignment.copy());
      }
    }
    return assignments;
  }

  /**
   * Get the person's name
   */
  get name(): string {
    this.update();
    return this._name;
  }

  /**
   * Get the person's skills
   */
  get skills(): Skill[] {
    this.update();
    return this._skills;
  }

  /**
   * Get the person's job title
   */
  get job(): string {
    this.update();
    return this._job;
  }

  /**
   * Get the person's avatar URL
   */
  get avatar(): URL | undefined {
    this.update();
    return this._avatar;
  }

  /**
   * Get the person's birthday
   */
  get birthday(): CalendarDate | undefined {
    this.update();
    return this._birthday;
  }

  /**
   * Get the initials of the person's name
   */
  get initials(): string {
    this.update();
    return misc.getInitials(this._name);
  }

  /**
   * Get the person's age
   * @returns The person's age in years, or undefined if the birthday is not set.
   */
  get age(): number | undefined {
    this.update();

    if (!this._birthday) {
      return undefined;
    }

    return fullYearsBetween(this._birthday, now(getLocalTimeZone()));
  }

  /**
   * Set the person's name
   */
  set name(name: string) {
    this._name = name;
    this.touch();
  }

  /**
   * Set the person's skills
   */
  set skills(skills: Skill[]) {
    this._skills = copyArr(skills);
    this.touch();
  }

  /**
   * Set the person's job title
   */
  set job(job: string) {
    this._job = job;
    this.touch();
  }

  /**
   * Set the person's avatar URL
   */
  set avatar(avatar: URL | string | undefined) {
    if (typeof avatar === "string") {
      avatar = new URL(avatar);
    }
    this._avatar = avatar;
    this.touch();
  }

  /**
   * Set the person's birthday
   */
  set birthday(birthday: CalendarDate | undefined) {
    this._birthday = birthday;
    this.touch();
  }
}
