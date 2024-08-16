import { getAssignedPeopleForTask, type Task } from "$lib/types/task.ts";
import type { Person } from "$lib/types/person.ts";
import { v4 as uuidv4 } from "uuid";
import { Type } from "$lib/types/index.ts";
import { getLocation, getTask } from "$lib/stores.ts";

export interface ShiftProps {
  name: string;
  description: string;
  start_date_time: Date;
  end_date_time: Date;
  location_uuid: string;
  task_uuids: string[];
}

export interface Shift extends ShiftProps {
  uuid: string;
  type: Type.Shift;
}

export function createShift(props: ShiftProps): Shift {
  return {
    uuid: uuidv4(),
    type: Type.Shift,
    ...props
  };
}

export function getTasksForShift(shift: Shift): Task[] {
  return shift.task_uuids.map((uuid) => getTask(uuid)).filter((t) => t !== undefined);
}

export function getPeopleForShift(shift: Shift): Person[] {
  return [...new Set(getTasksForShift(shift).flatMap((t) => getAssignedPeopleForTask(t)))];
}

export function getLocationForShift(shift: Shift) {
  return getLocation(shift.location_uuid);
}
