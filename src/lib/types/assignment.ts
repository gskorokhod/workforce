import { getAssignedPeopleForTask, type Task } from "$lib/types/task.ts";
import type { Person } from "$lib/types/person.ts";
import { v4 as uuidv4 } from "uuid";
import { Type } from "$lib/types/index.ts";
import { getLocation, getTask } from "$lib/stores.ts";

export interface AssignmentProps {
  name: string;
  description: string;
  start_date_time: Date;
  end_date_time: Date;
  location_uuid: string;
  task_uuids: string[];
}

export interface Assignment extends AssignmentProps {
  uuid: string;
  type: Type.Assignment;
}

export function createAssignment(props: AssignmentProps): Assignment {
  return {
    uuid: uuidv4(),
    type: Type.Assignment,
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
