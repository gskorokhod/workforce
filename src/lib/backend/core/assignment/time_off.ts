import { TimeSlot } from "$lib/backend/temporal";
import { Icon } from "$lib/backend/ui";
import { parseDate, type CalendarDate, type DateValue } from "@internationalized/date";
import type { JsonObject } from "type-fest";
import { Assignment, AssignmentType, type IAssignment } from ".";
import { Person, State } from "..";

interface ITimeOff extends IAssignment {
  date: CalendarDate;
}

interface TimeOffProps {
  date: CalendarDate;
  person?: Person;
}

export class TimeOff extends Assignment implements ITimeOff {
  date: CalendarDate;

  constructor(props: TimeOffProps, state?: State, uuid?: string) {
    super(
      AssignmentType.DAY_OFF,
      {
        name: "Time Off",
        description: "This person has time off on this day.",
        icon: Icon.fromString("lucide:calendar-off"),
        person: props.person
      },
      state,
      uuid
    );
    this.date = props.date;
  }

  /**
   * Get a TimeOff by UUID from a state or array of assignments.
   * @param from State or array of assignments to search.
   * @param uuid UUID of the TimeOff to get.
   * @returns TimeOff with the given UUID or undefined if not found.
   */
  static get(from: State | Assignment[], uuid: string): TimeOff | undefined {
    const ans = Assignment.get(from, uuid);
    return ans instanceof TimeOff ? ans : undefined;
  }

  /**
   * Get all TimeOff from a state or array of assignments.
   * @param from State or array of assignments to search.
   * @returns Array of TimeOff assignments.
   */
  static getAll(from: State | Assignment[]): TimeOff[] {
    return Assignment.getAll(from).filter((assignment) => assignment instanceof TimeOff);
  }

  /**
   * Get all TimeOff for a given person.
   * @param from State or array of assignments
   * @param person Person to check
   * @returns Array of TimeOff for the given person
   */
  static getForPerson(from: State | Assignment[], person: Person): TimeOff[] {
    return Assignment.getForPerson(from, person).filter(
      (assignment) => assignment instanceof TimeOff
    ) as TimeOff[];
  }

  /**
   * Get all TimeOff between two dates.
   * @param from State or array of assignments
   * @param after Start date (inclusive). If undefined, there is no lower bound.
   * @param before End date (inclusive). If undefined, there is no upper bound.
   * @returns Array of TimeOff between the two dates.
   */
  static getBetween(from: State | Assignment[], after?: DateValue, before?: DateValue): TimeOff[] {
    return Assignment.getBetween(from, after, before).filter(
      (assignment) => assignment instanceof TimeOff
    );
  }

  /**
   * Get all TimeOff assignments on a given date.
   * @param from State or array of assignments
   * @param date Date to check
   * @returns Array of TimeOff assignments on the given date
   */
  static getOn(from: State | Assignment[], date: CalendarDate): TimeOff[] {
    return Assignment.getOn(from, date).filter((assignment) => assignment instanceof TimeOff);
  }

  static fromJSON(json: JsonObject, state?: State): TimeOff {
    const { date, person, uuid } = json;
    return new TimeOff(
      {
        date: parseDate(date as string),
        person: Person.fromJSON(person as JsonObject, state)
      },
      state,
      typeof uuid === "string" ? uuid : undefined
    );
  }

  toJSON(): JsonObject {
    return {
      ...super.toJSON(),
      date: this.date.toString()
    };
  }

  copy(): TimeOff {
    return new TimeOff(
      {
        date: this.date,
        person: this.person
      },
      this.state,
      this.uuid
    );
  }

  get timeslot(): TimeSlot {
    return TimeSlot.allDay(this.date);
  }
}
