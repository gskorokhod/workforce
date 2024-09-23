import type { State } from "$lib/model";
import { generateLocation, generateLocations, generateTrueLocation } from "./location";
import { generatePeople, generatePerson } from "./person";
import { generateShift, generateShifts } from "./shift";
import { generateSkill, generateSkills } from "./skill";
import { generateTask, generateTasks } from "./task";

export function populateState(state: State): void {
  state.clear();
  state.putAll(generateSkills(10, 20, state));
  state.putAll(generateLocations(10, 20, state));
  state.putAll(generateTasks(10, 20, state));
  state.putAll(generateShifts(10, 20, state));
  state.putAll(generatePeople(10, 20, state));
}

export {
  generateLocation,
  generatePerson,
  generateShift,
  generateSkill,
  generateTask,
  generateTrueLocation
};
