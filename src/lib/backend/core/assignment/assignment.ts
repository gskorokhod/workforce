import { copyArr } from "$lib/backend/utils";
import type { DateValue } from "@internationalized/date";
import { get as _get } from "svelte/store";
import type { JsonObject } from "type-fest";
import { Base, Person, State } from "..";
import { TimeSlot } from "../../temporal";
import type { Display, Icon } from "../../ui";

export interface IAssignment extends Display {
  person?: Person;
  timeslot?: TimeSlot;
}

export abstract class Assignment extends Base implements IAssignment {
  name: string;
  description: string;
  icon?: Icon;
  private _person?: Person;

  constructor(props: Partial<IAssignment>, state?: State, uuid?: string) {
    super(state, uuid);

    this.name = props.name || "";
    this.description = props.description || "";
    this.icon = props.icon;
    this._person = props.person?.copy();
  }

  /**
   * Get an assignment by UUID (by copy)
   * @param from State or array of assignments
   * @param uuid UUID of the assignment to get
   * @returns Assignment with the given UUID or undefined if not found
   */
  static get(from: State | Assignment[], uuid: string): Assignment | undefined {
    if (from instanceof State) {
      return from.get(uuid) as Assignment | undefined;
    }
    return from.find((assignment) => assignment.uuid === uuid)?.copy();
  }

  /**
   * Get all assignments (by copy)
   * @param from State or array of assignments
   * @returns Array of assignments
   */
  static getAll(from: State | Assignment[]): Assignment[] {
    if (from instanceof State) {
      return copyArr(Array.from(_get(from._assignments).values()));
    }
    return copyArr(from);
  }

  /**
   * Get all assignments for a given person.
   * @param from State or array of assignments
   * @param person Person to check
   * @returns Array of assignments for the given person
   */
  static getForPerson(from: State | Assignment[], person: Person): Assignment[] {
    return Assignment.getAll(from).filter((a) => a.person?.eq(person));
  }

  /**
   * Get all assignments that fall entirely within a given time slot.
   * @param from State or array of assignments
   * @param time Time slot to check
   * @returns Array of assignments that fall entirely within the given time slot
   */
  static getDuring(from: State | Assignment[], time: TimeSlot): Assignment[] {
    return Assignment.getAll(from).filter((a) => a.timeslot && time.includes(a.timeslot));
  }

  /**
   * Get all assignments that intersect with a given time slot.
   * @param from State or array of assignments
   * @param time Time slot to check
   * @returns Array of assignments that intersect with the given time slot
   */
  static getIntersecting(from: State | Assignment[], time: TimeSlot): Assignment[] {
    return Assignment.getAll(from).filter((a) => a.timeslot && time.intersects(a.timeslot));
  }

  /**
   * Get all assignments that occur between two dates.
   * @param from State or array of assignments
   * @param after Start date (inclusive). If undefined, there is no lower bound.
   * @param before End date (inclusive). If undefined, there is no upper bound.
   * @returns Array of assignments that occur between the two dates
   */
  static getBetween(
    from: State | Assignment[],
    after?: DateValue,
    before?: DateValue
  ): Assignment[] {
    return Assignment.getAll(from).filter((assignment) => {
      if (!assignment.timeslot) return false;
      let ans = true;
      ans = ans && (!after || assignment.timeslot.start.compare(after) >= 0);
      ans = ans && (!before || assignment.timeslot.end.compare(before) <= 0);
      return ans;
    });
  }

  /**
   * Get all assignments that are active on a given date.
   * @param from State or array of assignments
   * @param date Date to check
   * @param strict If true, return assignments that start and end on the given date. If false, return assignments that occur at any point on the given date. Default is false.
   * @returns Array of assignments that are active on the given date
   */
  static getOn(from: State | Assignment[], date: DateValue, strict: boolean = false): Assignment[] {
    if (strict) {
      return Assignment.getDuring(from, TimeSlot.allDay(date));
    } else {
      return Assignment.getIntersecting(from, TimeSlot.allDay(date));
    }
  }

  /**
   * Create a copy of this assignment.
   */
  abstract copy(): Assignment;

  /**
   * Get the time slot that this assignment covers.
   */
  abstract get timeslot(): TimeSlot | undefined;

  toJSON(): JsonObject {
    return {
      uuid: this.uuid,
      name: this.name,
      description: this.description || "",
      icon: this.icon?.toJSON() || null,
      person: this._person?.toJSON() || null
    };
  }

  get person(): Person | undefined {
    return this._person?.get() as Person | undefined;
  }

  set person(person: Person | undefined) {
    this._person = person?.copy();
  }
}
