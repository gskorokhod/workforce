import { getInitials } from "$lib/utils.ts";
import type { Skill } from "$lib/types/skill.ts";
import { v4 as uuidv4 } from "uuid";
import { Type } from "$lib/types/index.ts";
import { getSkill } from "$lib/stores.ts";

export interface PersonProps {
  name: string;
  job_title: string;
  image_url: string;
  birthday: Date;
  skill_uuids: string[];
}

export interface Person extends PersonProps {
  uuid: string;
  type: Type.Person;
}

export function createPerson(props: PersonProps): Person {
  return {
    uuid: uuidv4(),
    type: Type.Person,
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
    name: "",
    job_title: "",
    skill_uuids: [],
    image_url: "",
    birthday: new Date()
  };
}
