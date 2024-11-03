import type { JsonObject } from "type-fest";
import type { State } from "../state";
import { Assignment, AssignmentType, type IAssignment } from "./assignment";
import { SimpleAssignment } from "./simple_assignment";
import { TimeOff } from "./time_off";

export function parseAssignment(json: JsonObject, state?: State): Assignment {
  const { type } = json;
  // eslint-disable-next-line sonarjs/no-small-switch
  switch (type) {
    case AssignmentType.SIMPLE:
      return SimpleAssignment.fromJSON(json, state);
    default:
      throw new Error(`Unknown assignment type: ${type}`);
  }
}

export { Assignment, AssignmentType, SimpleAssignment, TimeOff, type IAssignment };
