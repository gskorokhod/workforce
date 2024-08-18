import type { Person } from "$lib/types/person.ts";
import type { Skill } from "$lib/types/skill.ts";
import type { IconType } from "$lib/types/ui.ts";

import { employees, getPerson, getSkill } from "$lib/stores";
import { Type } from "$lib/types/index.ts";
import { get } from "svelte/store";
import { v4 as uuidv4 } from "uuid";

export interface TaskProps {
  description: string;
  icon: IconType;
  max_people: number;
  min_people: number;
  name: string;
  people_uuids: string[];
  required_skill_uuids: string[];
}

export interface Task extends TaskProps {
  type: Type.Task;
  uuid: string;
}

export function createTask(props: TaskProps): Task {
  return {
    type: Type.Task,
    uuid: uuidv4(),
    ...props
  };
}

export function getRequiredSkillsForTask(task: Task): Skill[] {
  return task.required_skill_uuids.map((uuid) => getSkill(uuid)).filter((s) => s !== undefined);
}

export function getAssignedPeopleForTask(task: Task): Person[] {
  return task.people_uuids.map((uuid) => getPerson(uuid)).filter((p) => p !== undefined);
}

export function getCandidatesForTask(task: Task): Person[] {
  const employees_list = get(employees);
  const required_skills = new Set(task.required_skill_uuids);
  return employees_list.filter((p) => required_skills.isSubsetOf(new Set(p.skill_uuids)));
}

export function defaultTaskProps(): TaskProps {
  return {
    description: "",
    icon: {
      color: undefined,
      icon: ""
    },
    max_people: 1,
    min_people: 0,
    name: "",
    people_uuids: [],
    required_skill_uuids: []
  };
}
