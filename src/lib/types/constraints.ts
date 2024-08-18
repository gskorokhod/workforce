// ToDo: Each constraint must contain an ical type to reflect the time when it applies
// ToDo: Discuss with Oz & add more constraints

import type { Location } from "$lib/types/location.ts";
import type { Person } from "$lib/types/person.ts";
import type { Task } from "$lib/types/task.ts";

export enum ConstraintType {
  NoLocation = "NoLocation",
  NoPerson = "NoPerson",
  NoTask = "NoTask"
}

export interface NoPersonConstraint {
  applies_to: Location | Person | Task;
  person: Person;
  type: ConstraintType.NoPerson;
}

export interface NoLocationConstraint {
  applies_to: Person | Task;
  location: Location;
  type: ConstraintType.NoLocation;
}

export interface NoTaskConstraint {
  applies_to: Location | Person;
  task: Task;
  type: ConstraintType.NoTask;
}

export type Constraint = NoLocationConstraint | NoPersonConstraint | NoTaskConstraint;
export type ConstraintOperand = Location | Person | Task;

export function getOperands(constraint: Constraint): ConstraintOperand[] {
  switch (constraint.type) {
    case ConstraintType.NoPerson:
      return [constraint.applies_to, constraint.person];
    case ConstraintType.NoLocation:
      return [constraint.applies_to, constraint.location];
    case ConstraintType.NoTask:
      return [constraint.applies_to, constraint.task];
  }
}

export function appliesTo(constraint: Constraint, item: ConstraintOperand): boolean {
  return getOperands(constraint)
    .map((o) => o.uuid)
    .includes(item.uuid);
}
