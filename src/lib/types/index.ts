import type { Assignment, AssignmentProps } from "$lib/types/assignment.ts";
import type { Constraint, ConstraintOperand,ConstraintType } from "$lib/types/constraints.ts";
import type { Location, LocationProps } from "$lib/types/location.ts";
import type { Person, PersonProps } from "$lib/types/person.ts";
import type { Skill, SkillProps } from "$lib/types/skill.ts";
import type { Task, TaskProps } from "$lib/types/task.ts";
import type { IconType } from "$lib/types/ui.ts";

import { defaultLocationProps } from "$lib/types/location.ts";
import { defaultPersonProps } from "$lib/types/person.ts";
import { defaultSkillProps } from "$lib/types/skill.ts";
import { defaultTaskProps } from "$lib/types/task.ts";

export enum Type {
  Assignment = "Assignment",
  Location = "Location",
  Person = "Person",
  Skill = "Skill",
  Task = "Task"
}

export type {
  Assignment,
  AssignmentProps,
  Constraint,
  ConstraintOperand,
  ConstraintType,
  IconType,
  Location,
  LocationProps,
  Person,
  PersonProps,
  Skill,
  SkillProps,
  Task,
  TaskProps};

export { defaultLocationProps, defaultPersonProps, defaultSkillProps, defaultTaskProps };
