import type { State } from "$lib/model";
import { generateLocation, generateLocations, generateTrueLocation } from "./location";
import { generatePeople, generatePerson } from "./person";
import { generateQualification, generateQualifications } from "./qualification";
import { generateShift, generateShifts } from "./shift";
import { generateTask, generateTasks } from "./task";

export function populateState(state: State): void {
  state.clear();
  state.putAll(generateQualifications(5, 10, state));
  state.putAll(generateLocations(5, 10, state));
  state.putAll(generateTasks(5, 10, state));
  state.putAll(generateShifts(2, 3, state));
  state.putAll(generatePeople(5, 10, state));
}

export {
  generateLocation,
  generatePerson,
  generateShift,
  generateQualification as generateSkill,
  generateTask,
  generateTrueLocation,
};

