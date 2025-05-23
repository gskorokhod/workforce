import { parseDate, CalendarDate } from "@internationalized/date";
import type { JsonObject } from "type-fest";
import { z } from "zod";
import { dToday, thisWeekStart } from "$lib/model/core/misc";

export const planningHorizonSchema = z.union([
  z.object({
    mode: z.literal("fixed"),
    startDate: z.string().default(dToday().toString()).transform(parseDate),
    endDate: z
      .string()
      .default(dToday().add({ months: 1 }).toString())
      .transform(parseDate),
  }),
  z.object({
    mode: z.literal("floating"),
    durationWeeks: z.number().default(4),
  }),
]);
export type PlanningHorizonSetting = z.infer<typeof planningHorizonSchema>;

export function planningHorizonJSON(
  settings: Partial<PlanningHorizonSetting> | undefined | null,
): JsonObject {
  if (settings && settings.mode === "fixed") {
    return {
      mode: "fixed",
      startDate: settings.startDate?.toString() ?? null,
      endDate: settings.endDate?.toString() ?? null,
    };
  } else if (settings && settings.mode === "floating") {
    return {
      mode: "floating",
      durationWeeks: settings.durationWeeks ?? null,
    };
  }
  return { mode: "floating", durationWeeks: null };
}

export interface PlanningHorizon {
  start: CalendarDate;
  end: CalendarDate;
}

export function getPlanningHorizon(
  settings: Partial<PlanningHorizonSetting> | undefined | null,
): PlanningHorizon {
  if (settings && settings.mode === "fixed") {
    // Fixed mode - use the provided start and end dates
    return {
      start: settings.startDate ?? thisWeekStart(),
      end: settings.endDate ?? thisWeekStart().add({ months: 1 }),
    };
  } else if (settings && settings.mode === "floating") {
    // Floating mode - start of this week + duration
    const startDate = thisWeekStart();
    const endDate = startDate.add({ weeks: settings.durationWeeks ?? 4 });
    return { start: startDate, end: endDate };
  }
  // Default to 1 month from this week's start
  const startDate = thisWeekStart();
  return {
    start: startDate,
    end: startDate.add({ months: 1 }),
  };
}

const settingsSchema = z.object({
  development: z.boolean().default(true),
  askDeleteConfirmation: z.boolean().default(true),
  assignmentMode: z.enum(["simple", "granular"]).default("simple"),
  planningHorizon: planningHorizonSchema.nullish(),
});

export type Settings = z.infer<typeof settingsSchema>;

export const DefaultSettings: Settings = settingsSchema.parse({});
export const SettingsSerializer = {
  parse: (value: string): Settings => settingsSchema.parse(JSON.parse(value)),
  stringify: (val: Settings): string =>
    JSON.stringify({
      development: val.development,
      askDeleteConfirmation: val.askDeleteConfirmation,
      assignmentMode: val.assignmentMode,
      planningHorizon: planningHorizonJSON(val.planningHorizon),
    }),
};
