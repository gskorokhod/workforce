import { parseDate, type CalendarDate } from "@internationalized/date";
import { Assignment, type IAssignment } from "./assignment";
import type { JsonObject } from "type-fest";
import { Person, type State } from "..";
import { Icon } from "$lib/backend/ui";
import { TimeSlot } from "$lib/backend/temporal";

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
    super({
      name: "Time Off",
      description: "This person has time off on this day.",
      icon: Icon.fromString("lucide:calendar-off"),
      person: props.person,
    }, state, uuid);
    this.date = props.date;
  }

  static fromJSON(json: JsonObject, state?: State): TimeOff {
    const { date, person, uuid } = json;
    return new TimeOff(
      {
        date: parseDate(date as string),
        person: Person.fromJSON(person as JsonObject, state),
      },
      state,
      typeof uuid === "string" ? uuid : undefined
    );
  }

  toJSON(): JsonObject {
    return {
      ...super.toJSON(),
      date: this.date.toString(),
    };
  }

  copy(): TimeOff {
    return new TimeOff({
      date: this.date,
      person: this.person
    }, this.state, this.uuid);
  }

  get timeslot(): TimeSlot {
    return TimeSlot.allDay(this.date);
  }
}