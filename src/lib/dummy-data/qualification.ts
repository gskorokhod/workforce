/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Qualification, State } from "$lib/model";
import { Icon } from "$lib/ui";
import { faker } from "@faker-js/faker";
import Color from "color";
import { get } from "svelte/store";
import { sample, select } from "./misc";

const SKILLS = new Map<string, Icon>([
  ["Nurse", Icon.fromString("lucide:pill-bottle")],
  ["Doctor", Icon.fromString("lucide:stethoscope")],
  ["Driver", Icon.fromString("lucide:car")],
  ["Engineer", Icon.fromString("lucide:wrench")],
  ["Cook", Icon.fromString("lucide:chef-hat")],
  ["Care Worker", Icon.fromString("lucide:heart")],
  ["Front Desk", Icon.fromString("lucide:user")],
]);

const PREFIXES = ["Junior", "Senior", "Assistant", "Lead", ""];

function withPrefix(qualification: string): string {
  const prefix = select(PREFIXES);
  if (prefix === "") {
    return qualification;
  } else {
    return `${prefix} ${qualification}`;
  }
}

function randomQualification(): [string, Icon] {
  const keys = Array.from(SKILLS.keys());
  const key = select(keys);
  const icon = SKILLS.get(key)!;
  icon.color = new Color(faker.color.rgb());
  return [withPrefix(key), icon];
}

export function generateQualification(state?: State): Qualification {
  const [name, icon] = randomQualification();
  const description = faker.lorem.sentence();
  return new Qualification(
    {
      name,
      description,
      icon,
    },
    state,
  );
}

export function sampleQualifications(state: State, n: number, max?: number): Qualification[] {
  if (max && max > n) {
    n = faker.number.int({ min: n, max: max });
  }

  const qualifications = get(state.qualifications);

  let missing = n - qualifications.length;
  while (missing > 0) {
    state.put(generateQualification(state));
    missing--;
  }

  return sample(get(state.qualifications), n);
}

export function generateQualifications(n: number, max?: number, state?: State): Qualification[] {
  if (max && max > n) {
    n = faker.number.int({ min: n, max: max });
  }
  return Array.from({ length: n }, () => generateQualification(state));
}
