import type { Assignment, Location, Person, Skill, Task } from "$lib/types";
import type { IconType } from "$lib/types/ui.ts";

import { createAssignment } from "$lib/types/assignment.ts";
import { type Constraint, ConstraintType } from "$lib/types/constraints.ts";
import { createLocation } from "$lib/types/location.ts";
import { createPerson } from "$lib/types/person.ts";
import { createSkill } from "$lib/types/skill.ts";
import { createTask } from "$lib/types/task.ts";
import { reverseGeocode } from "$lib/utils/osm.ts";
import { sample, sampleOne } from "$lib/utils/utils.ts";
import { faker } from "@faker-js/faker";

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

const TASK_WORDS = [
  "Cleaning",
  "Front Desk",
  "Stocking",
  "Cooking",
  "Delivery",
  "Maintenance",
  "Security",
  "Customer Service",
  "Code Review",
  "Management",
  "Research",
  "Design",
  "Teaching",
  "Training",
  "Writing",
  "Editing",
  "Marketing",
  "Sales",
  "Support",
  "QA"
];

const TASK_SUFFIXES = [
  "Worker",
  "Staff",
  "Manager",
  "Supervisor",
  "Specialist",
  "Assistant",
  "Associate",
  "Consultant",
  "Analyst",
  "Engineer",
  "Technician"
];

const SHIFT_PREFIXES = [
  "Morning",
  "Afternoon",
  "Evening",
  "Night",
  "Weekend",
  "Holiday",
  "Remote",
  "On-Site",
  "Training",
  "Emergency"
];

const LOCATION_SUFFIX_GENERATORS: (() => string)[] = [
  () => sampleOne(["A", "B", "C", "D", "E", "F"]) as string,
  () => faker.number.int({ max: 100, min: 1 }).toString()
];

const TASK_SUFFIX_GENERATORS: (() => string)[] = [
  () => sampleOne(TASK_SUFFIXES) as string,
  () => ""
];

const SHIFT_SUFFIX_GENERATORS: (() => string)[] = [
  () => sampleOne(["A", "B", "C", "D", "E", "F"]) as string,
  () => ""
];

export interface DummyDataGenProps {
  assignments: number;
  constraints: number;
  locations: number;
  people: number;
  skills: number;
  tasks: number;
}

export interface DummyData {
  assignments: Assignment[];
  constraints: Constraint[];
  locations: Location[];
  people: Person[];
  skills: Skill[];
  tasks: Task[];
}

export async function generateDummyData(props: DummyDataGenProps): Promise<DummyData> {
  const skills = generateSkills(props.skills);
  const locations = await generateLocations(props.locations);
  const people = generatePeople(props.people, skills);
  const tasks = generateTasks(props.tasks, skills, people);
  const assignments = await generateAssignments(props.assignments, locations, tasks);
  const constraints = generateConstraints(props.constraints, locations, people, tasks);

  return { assignments, constraints, locations, people, skills, tasks };
}

export function generateLocationName(): string {
  const suffixGen = sampleOne(LOCATION_SUFFIX_GENERATORS) as () => string;
  return `${sampleOne(LOCATION_WORDS)} ${suffixGen()}`;
}

export function generateTaskName(): string {
  const suffixGen = sampleOne(TASK_SUFFIX_GENERATORS) as () => string;
  return `${sampleOne(TASK_WORDS)} ${suffixGen()}`;
}

export function generateShiftName(): string {
  const suffixGen = sampleOne(SHIFT_SUFFIX_GENERATORS) as () => string;
  return `${sampleOne(SHIFT_PREFIXES)} Shift ${suffixGen()}`;
}

export function generateIcon(): IconType {
  return {
    color: faker.color.rgb(),
    icon: ICONIFY_ICONS[Math.floor(Math.random() * ICONIFY_ICONS.length)]
  };
}

export function generateSkill(): Skill {
  return createSkill({
    description: faker.lorem.sentence(),
    icon: generateIcon(),
    name: faker.hacker.ingverb()
  });
}

export function generateSkills(n: number): Skill[] {
  return Array.from({ length: n }, generateSkill);
}

export async function generateLocation(): Promise<Location> {
  const coordinates = faker.location.nearbyGPSCoordinate({
    isMetric: true,
    origin: ST_ANDREWS,
    radius: 2
  });

  const address =
    (await reverseGeocode(coordinates))?.display_name ?? faker.location.streetAddress();

  return createLocation({
    address,
    coordinates,
    image_url: faker.image.url(),
    name: generateLocationName()
  });
}

export async function generateLocations(n: number): Promise<Location[]> {
  return Promise.all(Array.from({ length: n }, generateLocation));
}

export function generatePerson(skills: Skill[]): Person {
  return createPerson({
    birthday: faker.date.birthdate(),
    image_url: faker.image.avatar(),
    job_title: faker.person.jobTitle(),
    name: faker.person.fullName(),
    skill_uuids: sample(skills, faker.number.int({ max: 3, min: 1 })).map((s) => s.uuid)
  });
}

export function generatePeople(n: number, skills: Skill[]): Person[] {
  return Array.from({ length: n }, () => generatePerson(skills));
}

export function generateTask(skills: Skill[], people: Person[]): Task {
  return createTask({
    description: faker.lorem.sentence(),
    icon: generateIcon(),
    max_people: faker.number.int({ max: 5, min: 3 }),
    min_people: faker.number.int({ max: 3, min: 1 }),
    name: generateTaskName(),
    people_uuids: sample(people, faker.number.int({ max: 3, min: 1 })).map((p) => p.uuid),
    required_skill_uuids: sample(skills, faker.number.int({ max: 3, min: 1 })).map((s) => s.uuid)
  });
}

export function generateTasks(n: number, skills: Skill[], people: Person[]): Task[] {
  return Array.from({ length: n }, () => generateTask(skills, people));
}

export async function generateAssignment(
  locations: Location[],
  tasks: Task[]
): Promise<Assignment> {
  const loc = sampleOne(locations) as Location;

  return createAssignment({
    description: faker.lorem.sentence(),
    end_date_time: faker.date.soon(),
    location_uuid: loc.uuid,
    name: generateShiftName(),
    start_date_time: faker.date.recent(),
    task_uuids: sample(tasks, faker.number.int({ max: 3, min: 1 })).map((t) => t.uuid)
  });
}

export function generateAssignments(
  n: number,
  locations: Location[],
  tasks: Task[]
): Promise<Assignment[]> {
  return Promise.all(Array.from({ length: n }, () => generateAssignment(locations, tasks)));
}

export function generateConstraintForLocation(
  loc: Location,
  people: Person[],
  tasks: Task[]
): Constraint {
  const CONSTRAINT_GENERATORS: (() => Constraint)[] = [
    () => {
      return {
        applies_to: loc,
        task: sampleOne(tasks) as Task,
        type: ConstraintType.NoTask
      };
    },
    () => {
      return {
        applies_to: loc,
        person: sampleOne(people) as Person,
        type: ConstraintType.NoPerson
      };
    },
    () => {
      return {
        applies_to: sampleOne(tasks) as Task,
        location: loc,
        type: ConstraintType.NoLocation
      };
    },
    () => {
      return {
        applies_to: sampleOne(people) as Person,
        location: loc,
        type: ConstraintType.NoLocation
      };
    }
  ];

  const gen = sampleOne(CONSTRAINT_GENERATORS) as () => Constraint;
  return gen();
}

export function generateConstraintForTask(
  task: Task,
  locations: Location[],
  people: Person[]
): Constraint {
  const CONSTRAINT_GENERATORS: (() => Constraint)[] = [
    () => {
      return {
        applies_to: sampleOne(locations) as Location,
        task: task,
        type: ConstraintType.NoTask
      };
    },
    () => {
      return {
        applies_to: sampleOne(people) as Person,
        task: task,
        type: ConstraintType.NoTask
      };
    },
    () => {
      return {
        applies_to: task,
        location: sampleOne(locations) as Location,
        type: ConstraintType.NoLocation
      };
    },
    () => {
      return {
        applies_to: task,
        person: sampleOne(people) as Person,
        type: ConstraintType.NoPerson
      };
    }
  ];

  const gen = sampleOne(CONSTRAINT_GENERATORS) as () => Constraint;
  return gen();
}

export function generateConstraintForPerson(
  person: Person,
  locations: Location[],
  people: Person[],
  tasks: Task[]
): Constraint {
  const CONSTRAINT_GENERATORS: (() => Constraint)[] = [
    () => {
      return {
        applies_to: sampleOne(locations) as Location,
        person: person,
        type: ConstraintType.NoPerson
      };
    },
    () => {
      return {
        applies_to: sampleOne(tasks) as Task,
        person: person,
        type: ConstraintType.NoPerson
      };
    },
    () => {
      return {
        applies_to: sampleOne(people) as Person,
        person: person,
        type: ConstraintType.NoPerson
      };
    },
    () => {
      return {
        applies_to: person,
        location: sampleOne(locations) as Location,
        type: ConstraintType.NoLocation
      };
    },
    () => {
      return {
        applies_to: person,
        task: sampleOne(tasks) as Task,
        type: ConstraintType.NoTask
      };
    }
  ];

  const gen = sampleOne(CONSTRAINT_GENERATORS) as () => Constraint;
  return gen();
}

export function generateConstraintForRandomLocation(
  locations: Location[],
  people: Person[],
  tasks: Task[]
): Constraint | undefined {
  const loc = sampleOne(locations);
  if (loc === undefined) return undefined;
  return generateConstraintForLocation(loc, people, tasks);
}

export function generateConstraintForRandomTask(
  locations: Location[],
  people: Person[],
  tasks: Task[]
): Constraint | undefined {
  const task = sampleOne(tasks);
  if (task === undefined) return undefined;
  return generateConstraintForTask(task, locations, people);
}

export function generateConstraintForRandomPerson(
  locations: Location[],
  people: Person[],
  tasks: Task[]
): Constraint | undefined {
  const person = sampleOne(people);
  if (person === undefined) return undefined;
  return generateConstraintForPerson(person, locations, people, tasks);
}

export function generateConstraints(
  n: number,
  locations: Location[],
  people: Person[],
  tasks: Task[]
): Constraint[] {
  const GENERATORS: (() => Constraint | undefined)[] = [
    () => generateConstraintForRandomLocation(locations, people, tasks),
    () => generateConstraintForRandomTask(locations, people, tasks),
    () => generateConstraintForRandomPerson(locations, people, tasks)
  ];

  return Array.from({ length: n }, () => {
    const gen = sampleOne(GENERATORS);
    if (gen === undefined) throw new Error("No constraint generator found");
    return gen();
  }).filter((c) => c !== undefined) as Constraint[];
}
