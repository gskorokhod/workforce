import { type Display, displaySchema } from "$lib/ui";
import { getLocalTimeZone, today, CalendarDate } from "@internationalized/date";
import type { HasUUID } from "$lib/utils/misc";
import type { JsonObject } from "type-fest";
import { getWeekStart } from "../temporal/utils";

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

export function dToday(): CalendarDate {
  return today(getLocalTimeZone());
}

export function thisWeekStart(): CalendarDate {
  return getWeekStart(dToday());
}
