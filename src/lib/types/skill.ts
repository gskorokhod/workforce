import type { Person } from "$lib/types/person.ts";
import type { Task } from "$lib/types/task.ts";
import type { IconType } from "$lib/types/ui.ts";

import { employees, tasks } from "$lib/stores.ts";
import { Type } from "$lib/types/index.ts";
import { get } from "svelte/store";
import { v4 as uuidv4 } from "uuid";

export interface SkillProps {
  description: string;
  icon: IconType;
  name: string;
}

export interface Skill extends SkillProps {
  type: Type.Skill;
  uuid: string;
}

export function createSkill(props: SkillProps): Skill {
  return {
    type: Type.Skill,
    uuid: uuidv4(),
    ...props
  };
}

export function getPeopleWithSkill(skill: Skill): Person[] {
  const employees_list = get(employees);
  return employees_list.filter((p) => p.skill_uuids.includes(skill.uuid));
}

export function getTasksWithSkill(skill: Skill): Task[] {
  const tasks_list = get(tasks);
  return tasks_list.filter((t) => t.required_skill_uuids.includes(skill.uuid));
}

export function defaultSkillProps(): SkillProps {
  return {
    description: "",
    icon: {
      color: undefined,
      icon: ""
    },
    name: ""
  };
}
