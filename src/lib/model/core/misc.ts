import type { JsonValue } from "type-fest";
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
