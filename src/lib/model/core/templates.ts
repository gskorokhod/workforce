import { Icon } from "$lib/ui";
import type { JsonObject } from "type-fest";
import { MultiSelectProperty, SelectProperty } from "./property";
import { PropertyValues } from "./property_values";

export interface Templates {
  person: PropertyValues;
  location: PropertyValues;
  shift: PropertyValues;
  task: PropertyValues;
  [key: string]: PropertyValues;
}

// Can't import State due to circular dependency. Using any until I figure out a better way.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function defaultTemplates(state: any): Templates {
  const team = new SelectProperty(
    { name: "Team", options: [], icon: Icon.fromString("lucide:users", "#52469A") },
    state,
    "team",
  );
  const roles = new MultiSelectProperty(
    { name: "Roles", icon: Icon.fromString("lucide:briefcase-business", "#469A7C"), options: [] },
    state,
    "roles",
  );
  const tags = new MultiSelectProperty(
    { name: "Tags", icon: Icon.fromString("lucide:tags", "#D48538"), options: [] },
    state,
    "tags",
  );
  return {
    person: new PropertyValues({
      state,
      values: [
        [team, null],
        [roles, null],
        [tags, null],
      ],
    }),
    location: new PropertyValues({
      state,
      values: [[tags, null]],
    }),
    shift: new PropertyValues({
      state,
      values: [[tags, null]],
    }),
    task: new PropertyValues({
      state,
      values: [[tags, null]],
    }),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function templatesSerializer(state: any) {
  return {
    parse: (val: string) => templatesFromJSON(JSON.parse(val), state),
    stringify: (val: Templates) => JSON.stringify(templatesToJSON(val)),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function templatesFromJSON(json: JsonObject, state: any): Templates {
  return {
    person: PropertyValues.fromJSON(json.person, state),
    location: PropertyValues.fromJSON(json.location, state),
    shift: PropertyValues.fromJSON(json.shift, state),
    task: PropertyValues.fromJSON(json.task, state),
  };
}

function templatesToJSON(templates: Templates): JsonObject {
  return {
    person: templates.person.toJSON(),
    location: templates.location.toJSON(),
    shift: templates.shift.toJSON(),
    task: templates.task.toJSON(),
  };
}
