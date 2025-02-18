import { TimeSlot } from "$lib/model/temporal";
import type { Display, Icon } from "$lib/ui";
import { type ZonedDateTime } from "@internationalized/date";
import { derived, type Readable } from "svelte/store";
import { Assignment, SimpleAssignment } from "./assignment";
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

  get name(): string {
    return this.shift.name;
  }

  get description(): string {
    return this.shift.description || "";
  }

  get icon(): Icon | undefined {
    return this.shift.icon;
  }

  get rAssignments(): Readable<Assignment[]> {
    return derived(this.shift.state.assignments, (assignments) =>
      assignments.filter((a) => {
        if (!this.includes(a.date)) {
          return false;
        }
        if (a instanceof SimpleAssignment) {
          return a.shift?.eq(this.shift);
        }
        // TODO: Implement complex assignments
        return false;
      }),
    );
  }
}
