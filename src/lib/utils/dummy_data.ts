import type { Person, Skill, Task, Location, Assignment } from "$lib/types";
import { type Constraint, ConstraintType } from "$lib/types/constraints.ts";
import type { IconType } from "$lib/types/ui.ts";
import { sample, sampleOne } from "$lib/utils/utils.ts";
import { createSkill } from "$lib/types/skill.ts";
import { createPerson } from "$lib/types/person.ts";
import { createTask } from "$lib/types/task.ts";
import { createLocation } from "$lib/types/location.ts";
import { createAssignment } from "$lib/types/assignment.ts";
import { reverseGeocode } from "$lib/utils/osm.ts";
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
  () => faker.number.int({ min: 1, max: 100 }).toString()
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
  people: number;
  tasks: number;
  locations: number;
  assignments: number;
  skills: number;
  constraints: number;
}

export interface DummyData {
  people: Person[];
  tasks: Task[];
  locations: Location[];
  assignments: Assignment[];
  skills: Skill[];
  constraints: Constraint[];
}

export async function generateDummyData(props: DummyDataGenProps): Promise<DummyData> {
  const skills = generateSkills(props.skills);
  const locations = await generateLocations(props.locations);
  const people = generatePeople(props.people, skills);
  const tasks = generateTasks(props.tasks, skills, people);
  const assignments = await generateAssignments(props.assignments, locations, tasks);
  const constraints = generateConstraints(props.constraints, locations, people, tasks);

  return { people, tasks, locations, assignments, skills, constraints };
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

export async function generateLocation(): Promise<Location> {
  const coordinates = faker.location.nearbyGPSCoordinate({
    origin: ST_ANDREWS,
    radius: 2,
    isMetric: true
  });

  const address =
    (await reverseGeocode(coordinates))?.display_name ?? faker.location.streetAddress();

  return createLocation({
    name: generateLocationName(),
    image_url: faker.image.url(),
    coordinates,
    address
  });
}

export async function generateLocations(n: number): Promise<Location[]> {
  return Promise.all(Array.from({ length: n }, generateLocation));
}

export function generatePerson(skills: Skill[]): Person {
  return createPerson({
    name: faker.person.fullName(),
    job_title: faker.person.jobTitle(),
    image_url: faker.image.avatar(),
    birthday: faker.date.birthdate(),
    skill_uuids: sample(skills, faker.number.int({ min: 1, max: 3 })).map((s) => s.uuid)
  });
}

export function generatePeople(n: number, skills: Skill[]): Person[] {
  return Array.from({ length: n }, () => generatePerson(skills));
}

export function generateTask(skills: Skill[], people: Person[]): Task {
  return createTask({
    name: generateTaskName(),
    description: faker.lorem.sentence(),
    icon: generateIcon(),
    min_people: faker.number.int({ min: 1, max: 3 }),
    max_people: faker.number.int({ min: 3, max: 5 }),
    required_skill_uuids: sample(skills, faker.number.int({ min: 1, max: 3 })).map((s) => s.uuid),
    people_uuids: sample(people, faker.number.int({ min: 1, max: 3 })).map((p) => p.uuid)
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
    name: generateShiftName(),
    description: faker.lorem.sentence(),
    start_date_time: faker.date.recent(),
    end_date_time: faker.date.soon(),
    location_uuid: loc.uuid,
    task_uuids: sample(tasks, faker.number.int({ min: 1, max: 3 })).map((t) => t.uuid)
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
        type: ConstraintType.NoTask,
        task: sampleOne(tasks) as Task,
        applies_to: loc
      };
    },
    () => {
      return {
        type: ConstraintType.NoPerson,
        person: sampleOne(people) as Person,
        applies_to: loc
      };
    },
    () => {
      return {
        type: ConstraintType.NoLocation,
        location: loc,
        applies_to: sampleOne(tasks) as Task
      };
    },
    () => {
      return {
        type: ConstraintType.NoLocation,
        location: loc,
        applies_to: sampleOne(people) as Person
      };
    }
  ];

  const gen = sampleOne(CONSTRAINT_GENERATORS);
  if (gen === undefined) throw new Error("No constraint generator found");
  else return gen();
}

export function generateConstraintForTask(
  task: Task,
  locations: Location[],
  people: Person[]
): Constraint {
  const CONSTRAINT_GENERATORS: (() => Constraint)[] = [
    () => {
      return {
        type: ConstraintType.NoTask,
        task: task,
        applies_to: sampleOne(locations) as Location
      };
    },
    () => {
      return {
        type: ConstraintType.NoTask,
        task: task,
        applies_to: sampleOne(people) as Person
      };
    },
    () => {
      return {
        type: ConstraintType.NoLocation,
        location: sampleOne(locations) as Location,
        applies_to: task
      };
    },
    () => {
      return {
        type: ConstraintType.NoPerson,
        person: sampleOne(people) as Person,
        applies_to: task
      };
    }
  ];

  const gen = sampleOne(CONSTRAINT_GENERATORS);
  if (gen === undefined) throw new Error("No constraint generator found");
  else return gen();
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
        type: ConstraintType.NoPerson,
        person: person,
        applies_to: sampleOne(locations) as Location
      };
    },
    () => {
      return {
        type: ConstraintType.NoPerson,
        person: person,
        applies_to: sampleOne(tasks) as Task
      };
    },
    () => {
      return {
        type: ConstraintType.NoPerson,
        person: person,
        applies_to: sampleOne(people) as Person
      };
    },
    () => {
      return {
        type: ConstraintType.NoLocation,
        location: sampleOne(locations) as Location,
        applies_to: person
      };
    },
    () => {
      return {
        type: ConstraintType.NoTask,
        task: sampleOne(tasks) as Task,
        applies_to: person
      };
    }
  ];

  const gen = sampleOne(CONSTRAINT_GENERATORS);
  if (gen === undefined) throw new Error("No constraint generator found");
  else return gen();
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
