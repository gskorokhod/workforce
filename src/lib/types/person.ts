import type { Skill } from "$lib/types/skill.ts";

import { getSkill } from "$lib/stores.ts";
import { Type } from "$lib/types/index.ts";
import { getInitials } from "$lib/utils/utils.ts";
import { v4 as uuidv4 } from "uuid";

export interface PersonProps {
  birthday: Date;
  image_url: string;
  job_title: string;
  name: string;
  skill_uuids: string[];
}

export interface Person extends PersonProps {
  type: Type.Person;
  uuid: string;
}

export function createPerson(props: PersonProps): Person {
  return {
    type: Type.Person,
    uuid: uuidv4(),
    ...props
  };
}

export function getInitialsForPerson(person: Person | PersonProps): string {
  return getInitials(person.name);
}

export function getAgeForPerson(person: Person | PersonProps): number {
  const today = new Date();
  return today.getFullYear() - person.birthday.getFullYear();
}

export function getSkillsForPerson(person: Person | PersonProps): Skill[] {
  return person.skill_uuids.map((uuid) => getSkill(uuid)).filter((s) => s !== undefined);
}

export function defaultPersonProps(): PersonProps {
  return {
    birthday: new Date(),
    image_url: "",
    job_title: "",
    name: "",
    skill_uuids: []
  };
}
