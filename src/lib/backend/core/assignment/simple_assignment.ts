import { parseDate, type CalendarDate } from "@internationalized/date";
import type { JsonObject } from "type-fest";
import { Assignment, Location, Shift, State } from "..";
import type { ShiftOccurrence } from "../occurrence";
import type { IAssignment } from "./assignment";

/**
 * Represents an assignment of one or more Person to a Shift on a Date
 */
interface ISimpleAssignment extends IAssignment {
  shift?: Shift;
  date?: CalendarDate;
  location?: Location;
}

/**
 * An assignment of one or more Person to a Shift on a Date
 */
export class SimpleAssignment extends Assignment implements ISimpleAssignment {
  private _shift?: Shift;
  private _location?: Location;
  date?: CalendarDate;

  constructor(props: Partial<ISimpleAssignment>, state?: State, uuid?: string) {
    super(props, state, uuid);

    this._shift = props.shift;
    this.date = props.date;
    this._location = props.location;
  }

  static fromJSON(json: JsonObject, state?: State): SimpleAssignment {
    const { shift, date, location, uuid } = json;
    return new SimpleAssignment(
      {
        shift: shift ? Shift.fromJSON(shift as JsonObject, state) : undefined,
        date: typeof date === "string" ? parseDate(date) : undefined,
        location: location ? Location.fromJSON(location as JsonObject, state) : undefined
      },
      state,
      typeof uuid === "string" ? uuid : undefined
    );
  }

  toJSON(): JsonObject {
    return {
      ...super.toJSON(),
      shift: this.shift?.toJSON() || null,
      date: this.date?.toString() || null,
      location: this.location?.toJSON() || null
    };
  }

  copy(): SimpleAssignment {
    return new SimpleAssignment(
      {
        shift: this._shift?.copy(),
        location: this._location?.copy(),
        date: this.date
      },
      this.state,
      this.uuid
    );
  }

  /**
   * Get the shift that people are assigned to
   */
  get shift(): Shift | undefined {
    return this._shift?.get() as Shift | undefined;
  }

  /**
   * Set the shift that people are assigned to
   */
  set shift(shift: Shift | undefined) {
    this._shift = shift?.copy();
  }

  /**
   * Get the shift occurrence for this assignment
   */
  get timeslot(): ShiftOccurrence | undefined {
    if (!this.shift || !this.date) {
      return undefined;
    }
    return this.shift.occurrenceOn(this.date);
  }

  /**
   * Get the location of the assignment
   */
  get location(): Location | undefined {
    return this._location?.get() as Location | undefined;
  }

  /**
   * Set the location of the assignment
   */
  set location(location: Location | undefined) {
    if (location) {
      this._location = location.copy();
    } else {
      this._location = undefined;
    }
  }
}
