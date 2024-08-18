import type { Person } from "$lib/types/person.ts";

import { getLocation, getTask } from "$lib/stores.ts";
import { Type } from "$lib/types/index.ts";
import { getAssignedPeopleForTask, type Task } from "$lib/types/task.ts";
import { v4 as uuidv4 } from "uuid";

export interface AssignmentProps {
  description: string;
  end_date_time: Date;
  location_uuid: string;
  name: string;
  start_date_time: Date;
  task_uuids: string[];
}

export interface Assignment extends AssignmentProps {
  type: Type.Assignment;
  uuid: string;
}

export function createAssignment(props: AssignmentProps): Assignment {
  return {
    type: Type.Assignment,
    uuid: uuidv4(),
    ...props
  };
}

export function getTasksForAssignment(assignment: Assignment): Task[] {
  return assignment.task_uuids.map((uuid) => getTask(uuid)).filter((t) => t !== undefined);
}

export function getPeopleForAssignment(assignment: Assignment): Person[] {
  return [
    ...new Set(getTasksForAssignment(assignment).flatMap((t) => getAssignedPeopleForTask(t)))
  ];
}

export function getLocationForAssignment(assignment: Assignment) {
  return getLocation(assignment.location_uuid);
}
