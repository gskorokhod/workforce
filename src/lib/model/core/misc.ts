import { Icon, type Display } from "$lib/ui";
import type { JsonObject, JsonValue } from "type-fest";
import type { State } from "./state";

interface Reviver<T> {
  fromJSON(json: JsonValue, state?: State): T;
}

export function revivedArr<T>(reviver: Reviver<T>, json: JsonValue, state?: State): T[] {
  if (!Array.isArray(json)) {
    return [];
  }

  return json.map((v) => reviver.fromJSON(v, state));
}

export function displayToJSON(display: Display): JsonObject {
  return {
    name: display.name,
    description: display.description || null,
    icon: display.icon?.toJSON() || null,
    avatar: display.avatar?.href || null,
  };
}

export function displayFromJSON(json: JsonValue): Display {
  const { name, description, icon, avatar } = json as JsonObject;
  return {
    name: name as string,
    description: description ? (description as string) : undefined,
    icon: icon ? Icon.fromJSON(icon as JsonObject) : undefined,
    avatar: avatar ? new URL(avatar as string) : undefined,
  };
}
