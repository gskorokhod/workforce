import { Person, State } from "$lib/model";
import { faker } from "@faker-js/faker";
import { CalendarDate, fromDate, toCalendarDate } from "@internationalized/date";
import { get } from "svelte/store";
import { sample } from "./misc";

function mkBirthday(): CalendarDate {
  const rawDate = faker.date.between({ from: new Date(1950, 0, 1), to: new Date(2000, 0, 1) });
  const zdt = fromDate(rawDate, "UTC");
  return toCalendarDate(zdt);
}

export function generatePerson(state: State): Person {
  const name = faker.person.fullName();
  const dob = mkBirthday();
  const avatar = new URL(faker.image.avatar());

  return new Person(
    {
      name,
      dob,
      avatar,
    },
    state,
  );
}

export function samplePeople(state: State, n: number, max?: number): Person[] {
  if (max && max > n) {
    n = faker.number.int({ min: n, max: max });
  }

  const people = get(state.people);
  let missing = n - people.length;

  while (missing > 0) {
    state.put(generatePerson(state));
    missing--;
  }

  return sample(get(state.people), n);
}

export function generatePeople(state: State, n: number, max?: number): Person[] {
  if (max && max > n) {
    n = faker.number.int({ min: n, max: max });
  }
  return Array.from({ length: n }, () => generatePerson(state));
}
