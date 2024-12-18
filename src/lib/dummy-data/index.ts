import type { State } from "$lib/model";
import { generateLocation, generateLocations, generateTrueLocation } from "./location";
import { generatePeople, generatePerson } from "./person";
import { generateShift, generateShifts } from "./shift";
import { generateSkill, generateSkills } from "./skill";
import { generateTask, generateTasks } from "./task";

export function populateState(state: State): void {
  state.clear();
  state.putAll(generateSkills(5, 10, state));
  state.putAll(generateLocations(5, 10, state));
  state.putAll(generateTasks(5, 10, state));
  state.putAll(generateShifts(1, 3, state));
  state.putAll(generatePeople(5, 10, state));
}

export {
  generateLocation,
  generatePerson,
  generateShift,
  generateSkill,
  generateTask,
  generateTrueLocation,
};
