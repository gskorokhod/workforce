import { State, Shift } from "$lib/model";
import { Icon } from "$lib/model/ui";
import { faker } from "@faker-js/faker";
import { sample, select } from "./misc";
import { generateRecurrence } from "./recurrence";
import { generateTasks, sampleTasks } from "./task";
import { get } from "svelte/store";

const SHIFTS: Map<string, Icon> = new Map([
  ["Morning", Icon.fromString("mdi:sunrise")],
  ["Day", Icon.fromString("mdi:weather-sunny")],
  ["Afternoon", Icon.fromString("mdi:weather-sunset")],
  ["Night", Icon.fromString("mdi:weather-night")]
]);

function randomShift(): [string, Icon] {
  const keys = Array.from(SHIFTS.keys());
  const key = select(keys);
  const icon = SHIFTS.get(key)!;
  return [key, icon];
}

export function generateShift(state?: State): Shift {
  const [name, icon] = randomShift();
  const description = faker.lorem.sentence();
  const tasks = state ? sampleTasks(state, 0, 3) : generateTasks(0, 3);

  return new Shift(
    {
      pattern: generateRecurrence(),
      tasks,
      name,
      description,
      icon
    },
    state
  );
}

export function sampleShifts(state: State, n: number, max?: number): Shift[] {
  if (max && max > n) {
    n = faker.number.int({ min: n, max: max });
  }

  const shifts = get(state.shifts);

  let missing = n - shifts.length;
  while (missing > 0) {
    state.put(generateShift(state));
    missing--;
  }

  return sample(get(state.shifts), n);
}

export function generateShifts(n: number, max?: number, state?: State): Shift[] {
  if (max && max > n) {
    n = faker.number.int({ min: n, max: max });
  }
  return Array.from({ length: n }, () => generateShift(state));
}
