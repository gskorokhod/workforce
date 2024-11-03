import { TimeSlot } from "$lib/backend/temporal";
import type { ZonedDateTime } from "@internationalized/date";
import { Assignment } from "./assignment/assignment";
import type { Shift } from "./shift";

/**
 * A timeslot representing an individual occurrence of a shift.
 */
export class ShiftOccurrence extends TimeSlot {
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
    return []; // TODO: Implement this
    // const ans = Assignment.getDuring(this.shift.state, this);
    // return ans.filter((a) => !a.shift || a.shift.eq(this.shift));
  }
}
