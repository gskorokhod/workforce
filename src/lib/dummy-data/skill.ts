import { Skill, State } from "$lib/backend";
import { Icon } from "$lib/backend/ui";
import { faker } from "@faker-js/faker";
import Color from "color";
import { get } from "svelte/store";
import { sample, select } from "./misc";

const SKILLS: Map<string, Icon> = new Map([
  ["Nurse", Icon.fromString("lucide:pill-bottle")],
  ["Doctor", Icon.fromString("lucide:stethoscope")],
  ["Driver", Icon.fromString("lucide:car")],
  ["Engineer", Icon.fromString("lucide:wrench")],
  ["Cook", Icon.fromString("lucide:chef-hat")],
  ["Care Worker", Icon.fromString("lucide:heart")],
  ["Front Desk", Icon.fromString("lucide:user")]
]);

const PREFIXES = ["Junior", "Senior", "Assistant", "Lead", ""];

function withPrefix(skill: string): string {
  const prefix = select(PREFIXES);
  if (prefix === "") {
    return skill;
  } else {
    return `${prefix} ${skill}`;
  }
}

function randomSkill(): [string, Icon] {
  const keys = Array.from(SKILLS.keys());
  const key = select(keys);
  const icon = SKILLS.get(key)!;
  icon.color = new Color(faker.color.rgb());
  return [withPrefix(key), icon];
}

export function generateSkill(state?: State): Skill {
  const [name, icon] = randomSkill();
  const description = faker.lorem.sentence();
  return new Skill(
    {
      name,
      description,
      icon
    },
    state
  );
}

export function sampleSkills(state: State, n: number, max?: number): Skill[] {
  if (max && max > n) {
    n = faker.number.int({ min: n, max: max });
  }

  const skills = get(state.skills);

  let missing = n - skills.length;
  while (missing > 0) {
    state.put(generateSkill(state));
    missing--;
  }

  return sample(get(state.skills), n);
}

export function generateSkills(n: number, max?: number, state?: State): Skill[] {
  if (max && max > n) {
    n = faker.number.int({ min: n, max: max });
  }
  return Array.from({ length: n }, () => generateSkill(state));
}
