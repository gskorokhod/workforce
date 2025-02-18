import { State } from "$lib/model";
import { generateLocation, generateLocations, generateTrueLocation } from "./location";
import { generatePeople, generatePerson } from "./person";
import { generateQualification, generateQualifications } from "./qualification";
import { generateShift, generateShifts } from "./shift";
import { generateTask, generateTasks } from "./task";

export const dummyState = new State("dummy");
populateState(dummyState);

export function populateState(state: State): void {
  state.clear();
  state.putAll(generateLocations(state, 5, 10));
  state.putAll(generateTasks(state, 5, 10));
  state.putAll(generateShifts(state, 2, 3));
  state.putAll(generatePeople(state, 5, 10));
}

export { generateLocation, generatePerson, generateShift, generateTask, generateTrueLocation };
