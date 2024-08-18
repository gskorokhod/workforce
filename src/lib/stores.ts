import { get } from "svelte/store";
import type { Skill } from "$lib/types/skill.ts";
import type { Person } from "$lib/types/person.ts";
import type { Location } from "$lib/types/location.ts";
import type { Task } from "$lib/types/task.ts";
import type { Assignment } from "$lib/types/assignment.ts";
import { appliesTo, type Constraint, type ConstraintOperand } from "$lib/types/constraints.ts";
import { persisted } from "svelte-persisted-store";
import * as devalue from "devalue";

export const skills = persisted<Skill[]>("skills", [], { serializer: devalue });
export const employees = persisted<Person[]>("employees", [], { serializer: devalue });
export const locations = persisted<Location[]>("locations", [], { serializer: devalue });
export const tasks = persisted<Task[]>("tasks", [], { serializer: devalue });
export const constraints = persisted<Constraint[]>("constraints", [], { serializer: devalue });
export const assignments = persisted<Assignment[]>("assignments", [], { serializer: devalue });

export function getConstraintsFor(item: ConstraintOperand): Constraint[] {
  return get(constraints).filter((c) => appliesTo(c, item));
}

export function getSkill(uuid: string | undefined): Skill | undefined {
  if (uuid === undefined) return undefined;
  return get(skills).find((s) => s.uuid === uuid);
}

export function getPerson(uuid: string | undefined): Person | undefined {
  if (uuid === undefined) return undefined;
  return get(employees).find((p) => p.uuid === uuid);
}

export function getTask(uuid: string | undefined): Task | undefined {
  if (uuid === undefined) return undefined;
  return get(tasks).find((t) => t.uuid === uuid);
}

export function getLocation(uuid: string | undefined): Location | undefined {
  if (uuid === undefined) return undefined;
  return get(locations).find((l) => l.uuid === uuid);
}

export function getAssignment(uuid: string | undefined): Assignment | undefined {
  if (uuid === undefined) return undefined;
  return get(assignments).find((a) => a.uuid === uuid);
}

export function deleteEmployee(employee: Person) {
  tasks.update((list) =>
    list.map((t) => {
      t.people_uuids = t.people_uuids.filter((p) => p !== employee.uuid);
      return t;
    })
  );
  constraints.update((list) => list.filter((c) => !appliesTo(c, employee)));
  employees.update((list) => list.filter((e) => e.uuid !== employee.uuid));
}

export function deleteSkill(skill: Skill) {
  employees.update((list) =>
    list.map((p) => {
      p.skill_uuids = p.skill_uuids.filter((s) => s !== skill.uuid);
      return p;
    })
  );
  tasks.update((list) =>
    list.map((t) => {
      t.required_skill_uuids = t.required_skill_uuids.filter((s) => s !== skill.uuid);
      return t;
    })
  );
  skills.update((list) => list.filter((s) => s.uuid !== skill.uuid));
}

export function deleteTask(task: Task) {
  assignments.update((list) =>
    list.map((s) => {
      s.task_uuids = s.task_uuids.filter((t) => t !== task.uuid);
      return s;
    })
  );
  constraints.update((list) => list.filter((c) => !appliesTo(c, task)));
  tasks.update((list) => list.filter((t) => t.uuid !== task.uuid));
}

export function deleteLocation(location: Location) {
  assignments.update((list) => {
    return list.filter((s) => s.location_uuid !== location.uuid);
  });
  locations.update((list) => list.filter((l) => l.uuid !== location.uuid));
}
