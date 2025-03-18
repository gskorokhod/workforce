import { TimeSlot } from "$lib/model/temporal";
import type { Display, Icon } from "$lib/ui";
import { type ZonedDateTime } from "@internationalized/date";
import { derived, type Readable } from "svelte/store";
import { type Assignment } from "./assignment";
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
    return derived(this.shift.state.assignments, (assignments) => {
      let ans: Assignment[] = [];
      for (const date of this.getDates()) {
        const res = assignments.byDate.get(date);
        ans = ans.concat(res || []);
      }
      return ans;
    });
  }
}
