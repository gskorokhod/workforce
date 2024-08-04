import type { Person, Skill, Task, Location, Shift } from "$lib/types";
import { fromDate } from "@internationalized/date";
import { faker } from "@faker-js/faker";
import { type Constraint, ConstraintType } from "$lib/types/constraints.ts";
import { constraints, employees, locations, tasks, shifts, skills } from "$lib/stores.ts";
import { get } from "svelte/store";
import type { IconType } from "$lib/types/ui.ts";
import { sample, sampleOne } from "$lib/utils.ts";
import { createSkill } from "$lib/types/skill.ts";
import { createPerson } from "$lib/types/person.ts";
import { createTask } from "$lib/types/task.ts";
import { createLocation } from "$lib/types/location.ts";
import { createShift } from "$lib/types/shift.ts";

const ST_ANDREWS: [latitude: number, longitude: number] = [-2.799, 56.34039];

const ICONIFY_ICONS = [
  "mdi:account",
  "mdi:home",
  "mdi:bell",
  "mdi:camera",
  "mdi:cart",
  "mdi:chat",
  "mdi:cloud",
  "mdi:email",
  "mdi:heart",
  "mdi:lock",
  "mdi:map",
  "mdi:music",
  "mdi:phone",
  "mdi:settings",
  "mdi:star",
  "mdi:thumb-up",
  "mdi:weather-sunny",
  "mdi:calendar",
  "mdi:folder",
  "mdi:gift"
];

const LOCATION_WORDS = [
  "Office",
  "Warehouse",
  "Store",
  "Restaurant",
  "Factory",
  "Shop",
  "Ward",
  "Unit",
  "Department",
  "Room",
  "Lab",
  "Studio",
  "Lecture Hall",
  "Clinic"
];

const LOCATION_SUFFIX_GENERATORS: (() => string)[] = [
  () => sampleOne(["A", "B", "C", "D", "E", "F"]) as string,
  () => faker.number.int({ min: 1, max: 100 }).toString()
];

export function generateLocationName(): string {
  const suffixGen = sampleOne(LOCATION_SUFFIX_GENERATORS) as () => string;
  return `${sampleOne(LOCATION_WORDS)} ${suffixGen()}`;
}

export function generateIcon(): IconType {
  return {
    icon: ICONIFY_ICONS[Math.floor(Math.random() * ICONIFY_ICONS.length)],
    color: faker.color.rgb()
  };
}

export function generateSkill(): Skill {
  return createSkill({
    name: faker.hacker.ingverb(),
    description: faker.lorem.sentence(),
    icon: generateIcon()
  });
}

export function generateSkills(n: number): Skill[] {
  return Array.from({ length: n }, generateSkill);
}

export function generatePerson(): Person {
  return createPerson({
    name: faker.person.fullName(),
    job_title: faker.person.jobTitle(),
    image_url: faker.image.avatar(),
    birthday: faker.date.birthdate(),
    skills: sampleSkills(faker.number.int({ min: 1, max: 3 }))
  });
}

export function generatePeople(n: number): Person[] {
  return Array.from({ length: n }, generatePerson);
}

export function generateTask(): Task {
  return createTask({
    name: faker.lorem.words(),
    description: faker.lorem.sentence(),
    icon: generateIcon(),
    min_people: faker.number.int({ min: 1, max: 3 }),
    max_people: faker.number.int({ min: 3, max: 5 }),
    required_skills: sampleSkills(faker.number.int({ min: 0, max: 3 })),
    people: samplePeople(faker.number.int({ min: 0, max: 3 }))
  });
}

export function generateTasks(n: number): Task[] {
  return Array.from({ length: n }, generateTask);
}

export function generateLocation(): Location {
  return createLocation({
    name: generateLocationName(),
    address: faker.location.streetAddress(),
    image_url: faker.image.url(),
    coordinates: faker.location.nearbyGPSCoordinate({
      origin: ST_ANDREWS,
      radius: 5,
      isMetric: true
    })
  });
}

export function generateLocations(n: number): Location[] {
  return Array.from({ length: n }, generateLocation);
}

export function generateShift(): Shift | undefined {
  const loc = sampleLocation();
  if (loc === undefined) return undefined;

  return createShift({
    name: faker.lorem.words(),
    description: faker.lorem.sentence(),
    start_date_time: fromDate(faker.date.recent(), "UTC"),
    end_date_time: fromDate(faker.date.soon(), "UTC"),
    location: loc,
    tasks: sampleTasks(faker.number.int({ min: 1, max: 3 }))
  });
}

export function generateShifts(n: number): Shift[] {
  return Array.from({ length: n }, generateShift).filter((s) => s !== undefined) as Shift[];
}

export function samplePerson(): Person | undefined {
  return sampleOne(get(employees));
}

export function sampleTask(): Task | undefined {
  return sampleOne(get(tasks));
}

export function sampleLocation(): Location | undefined {
  return sampleOne(get(locations));
}

export function sampleSkill(): Skill | undefined {
  return sampleOne(get(skills));
}

export function sampleConstraint(): Constraint | undefined {
  return sampleOne(get(constraints));
}

export function sampleShift(): Shift | undefined {
  return sampleOne(get(shifts));
}

export function samplePeople(n: number, unique: boolean = true): Person[] {
  return sample(get(employees), n, unique);
}

export function sampleTasks(n: number, unique: boolean = true): Task[] {
  return sample(get(tasks), n, unique);
}

export function sampleLocations(n: number, unique: boolean = true): Location[] {
  return sample(get(locations), n, unique);
}

export function sampleConstraints(n: number, unique: boolean = true): Constraint[] {
  return sample(get(constraints), n, unique);
}

export function sampleShifts(n: number, unique: boolean = true): Shift[] {
  return sample(get(shifts), n, unique);
}

export function sampleSkills(n: number, unique: boolean = true): Skill[] {
  return sample(get(skills), n, unique);
}

export function generateConstraintForLocation(loc: Location): Constraint {
  const CONSTRAINT_GENERATORS: (() => Constraint)[] = [
    () => {
      return {
        type: ConstraintType.NO_TASK_AT_LOCATION,
        task: sampleTask() as Task,
        location: loc
      };
    },
    () => {
      return {
        type: ConstraintType.NO_PERSON_AT_LOCATION,
        person: samplePerson() as Person,
        location: loc
      };
    }
  ];

  return sampleOne(CONSTRAINT_GENERATORS)();
}

export function generateConstraintForTask(task: Task): Constraint {
  return {
    type: ConstraintType.PERSON_CANNOT_DO_TASK,
    person: samplePerson() as Person,
    task: task
  };
}

export function generateConstraintForPerson(person: Person): Constraint {
  const CONSTRAINT_GENERATORS: (() => Constraint)[] = [
    () => {
      return {
        type: ConstraintType.NO_WORK_TOGETHER,
        people: [person, samplePerson() as Person]
      };
    },
    () => {
      return {
        type: ConstraintType.NO_PERSON_AT_LOCATION,
        person: person,
        location: sampleLocation() as Location
      };
    }
  ];

  return sampleOne(CONSTRAINT_GENERATORS)();
}

export function generateConstraintForRandomLocation(): Constraint | undefined {
  const loc = sampleLocation();
  if (loc === undefined) return undefined;
  return generateConstraintForLocation(loc);
}

export function generateConstraintForRandomTask(): Constraint | undefined {
  const task = sampleTask();
  if (task === undefined) return undefined;
  return generateConstraintForTask(task);
}

export function generateConstraintForRandomPerson(): Constraint | undefined {
  const person = samplePerson();
  if (person === undefined) return undefined;
  return generateConstraintForPerson(person);
}

export function generateConstraints(n: number): Constraint[] {
  const GENERATORS: (() => Constraint | undefined)[] = [
    generateConstraintForRandomLocation,
    generateConstraintForRandomTask,
    generateConstraintForRandomPerson
  ];

  return Array.from({ length: n }, () => sampleOne(GENERATORS)()).filter(
    (c) => c !== undefined
  ) as Constraint[];
}
