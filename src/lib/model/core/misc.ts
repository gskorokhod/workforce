import { type Display, displaySchema } from "$lib/ui";
import type { JsonObject } from "type-fest";
import type { HasUUID } from "$lib/utils/misc";

export type IdOr<T extends HasUUID> = T | string;

export function uuidOf<T extends HasUUID>(from: IdOr<T>): string {
  return typeof from === "string" ? from : from.uuid;
}

export function uuidsOf<T extends HasUUID>(from: Iterable<IdOr<T>>): string[] {
  return Array.from(from, uuidOf);
}

export function displayToJSON(display: Display): JsonObject {
  return {
    name: display.name,
    description: display.description ?? null,
    icon: display.icon?.toJSON() ?? null,
    avatar: display.avatar?.href ?? null,
  };
}

export function displayFromJSON(json: JsonObject): Display {
  return displaySchema.parse(json);
}
