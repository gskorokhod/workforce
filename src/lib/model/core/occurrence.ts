import { TimeSlot } from "$lib/model/temporal";
import type { Display, Icon } from "$lib/ui";
import { isSameDay, type ZonedDateTime } from "@internationalized/date";
import { Assignment } from "./assignment/assignment";
import { SimpleAssignment } from "./assignment/simple_assignment";
import { TimeOff } from "./assignment/time_off";
import type { Shift } from "./shift";

/**
 * A timeslot representing an individual occurrence of a shift.
 */
export class ShiftOccurrence extends TimeSlot implements Display {
  readonly shift: Shift;

  constructor(start: ZonedDateTime, end: ZonedDateTime, shift: Shift) {
    super(start, end);
    this.shift = shift;
  }

  /**
   * Gets the assignments that are active during this occurrence.
   * @returns The assignments that are active during this occurrence.
   */
  getAssignments(): Assignment[] {
    if (!this.shift.state) {
      return [];
    }
    const ans = Assignment.getAll(this.shift.state);
    return ans.filter((assignment) => {
      if (assignment instanceof TimeOff) {
        return false;
      }
      if (assignment instanceof SimpleAssignment) {
        return (
          assignment.shift?.eq(this.shift) &&
          assignment.date &&
          isSameDay(assignment.date, this.start)
        );
      }
    });
  }

  get name(): string {
    return this.shift.name;
  }

  get description(): string {
    return this.shift.description || "";
  }

  get icon(): Icon | undefined {
    return this.shift.icon;
  }
}
