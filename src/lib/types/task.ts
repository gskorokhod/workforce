import type { IconType } from "$lib/types/ui.ts";
import { get } from "svelte/store";
import type { Skill } from "$lib/types/skill.ts";
import type { Person } from "$lib/types/person.ts";
import { employees, getPerson, getSkill } from "$lib/stores";
import { v4 as uuidv4 } from "uuid";
import { Type } from "$lib/types/index.ts";

export interface TaskProps {
  name: string;
  description: string;
  icon: IconType;
  min_people: number;
  max_people: number;
  required_skill_uuids: string[];
  people_uuids: string[];
}

export interface Task extends TaskProps {
  uuid: string;
  type: Type.Task;
}

export function createTask(props: TaskProps): Task {
  return {
    uuid: uuidv4(),
    type: Type.Task,
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
    name: "",
    description: "",
    icon: {
      icon: "",
      color: undefined
    },
    min_people: 0,
    max_people: 1,
    required_skill_uuids: [],
    people_uuids: []
  };
}
