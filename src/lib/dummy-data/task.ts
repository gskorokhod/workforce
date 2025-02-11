import { State, Task } from "$lib/model";
import { Icon } from "$lib/ui";
import { faker } from "@faker-js/faker";
import { get } from "svelte/store";
import { sample, select } from "./misc";
import { generateQualifications, sampleQualifications } from "./qualification";

const ICONS = [
  Icon.fromString("mdi:cleaning"),
  Icon.fromString("mdi:food"),
  Icon.fromString("mdi:desk"),
  Icon.fromString("mdi:desktop-classic"),
  Icon.fromString("mdi:account-tie"),
  Icon.fromString("mdi:doctor"),
  Icon.fromString("mdi:toolbox"),
  Icon.fromString("mdi:heart"),
  Icon.fromString("mdi:teach"),
  Icon.fromString("mdi:account-group"),
  Icon.fromString("mdi:cog"),
];

const NAMES = [
  "Cleaning",
  "Canteen Duty",
  "Laundry",
  "Deliveries",
  "Reception",
  "Admin",
  "Meeting",
  "Nurse",
  "Nurse",
  "Therapist",
  "Training",
];

const PREFIXES = ["", "Floor 1 -", "Team B -", "Staff", "Lead"];

function withPrefix(task: string): string {
  const prefix = select(PREFIXES);
  if (prefix === "") {
    return task;
  } else {
    return `${prefix} ${task}`;
  }
}

export function generateTask(state?: State): Task {
  const name = withPrefix(select(NAMES));
  const description = faker.lorem.sentence();
  const icon = select(ICONS);
  const min = {
    people: faker.number.int({ min: 0, max: 3 }),
  };
  const max = {
    people: faker.number.int({ min: min.people, max: 10 }),
  };

  const qualifications = state ? sampleQualifications(state, 0, 3) : generateQualifications(0, 3);

  return new Task(
    {
      name,
      description,
      icon,
      min,
      max,
      qualifications,
    },
    state,
  );
}

export function sampleTasks(state: State, n: number, max?: number): Task[] {
  if (max && max > n) {
    n = faker.number.int({ min: n, max: max });
  }

  const tasks = get(state.tasks);

  let missing = n - tasks.length;
  while (missing > 0) {
    state.put(generateTask(state));
    missing--;
  }

  return sample(get(state.tasks), n);
}

export function generateTasks(n: number, max?: number, state?: State): Task[] {
  if (max && max > n) {
    n = faker.number.int({ min: n, max: max });
  }
  return Array.from({ length: n }, () => generateTask(state));
}
