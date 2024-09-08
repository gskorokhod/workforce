import { CalendarDate, getLocalTimeZone, now, parseDate } from "@internationalized/date";
import { get } from "svelte/store";
import type { JsonObject, JsonValue } from "type-fest";
import { fullYearsBetween } from "../temporal/utils";
import { copied, has, misc, without } from "../utils";
import type { Assignment } from "./assignment";
import { Base } from "./base";
import { revivedArr } from "./misc";
import { Skill } from "./skill";
import type { State } from "./state";

interface IPerson {
  name: string;
  skills: Skill[];
  job: string;
  avatar?: URL;
  birthday?: CalendarDate;
}

export class Person extends Base implements IPerson {
  private _name: string;
  private _skills: Skill[];
  private _job: string;
  private _avatar?: URL;
  private _birthday?: CalendarDate;

  constructor(props: Partial<IPerson>, state?: State, uuid?: string) {
    super(state, uuid);
    this._name = props.name || "";
    this._skills = props.skills || [];
    this._job = props.job || "";
    this._avatar = props.avatar;
    this._birthday = props.birthday;
  }

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

  dependencies(): Base[] {
    return this._skills;
  }

  removeDependency(dep: Base): void {
    if (dep instanceof Skill) {
      this.removeSkill(dep);
    }
  }

  copy(): Person {
    return new Person(
      {
        name: this._name,
        skills: copied(this._skills),
        job: this._job,
        avatar: this._avatar,
        birthday: this._birthday
      },
      this.state,
      this.uuid
    );
  }

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
      if (has(assignment.people, this)) {
        assignments.push(assignment.copy());
      }
    }
    return assignments;
  }

  get name(): string {
    this.update();
    return this._name;
  }

  get skills(): Skill[] {
    this.update();
    return this._skills;
  }

  get job(): string {
    this.update();
    return this._job;
  }

  get avatar(): URL | undefined {
    this.update();
    return this._avatar;
  }

  get birthday(): CalendarDate | undefined {
    this.update();
    return this._birthday;
  }

  get initials(): string {
    this.update();
    return misc.getInitials(this._name);
  }

  get age(): number | undefined {
    this.update();

    if (!this._birthday) {
      return undefined;
    }

    return fullYearsBetween(this._birthday, now(getLocalTimeZone()));
  }

  set name(name: string) {
    this._name = name;
    this.touch();
  }

  set skills(skills: Skill[]) {
    this._skills = copied(skills);
    this.touch();
  }

  set job(job: string) {
    this._job = job;
    this.touch();
  }

  set avatar(avatar: URL | undefined) {
    this._avatar = avatar;
    this.touch();
  }

  set birthday(birthday: CalendarDate | undefined) {
    this._birthday = birthday;
    this.touch();
  }
}
