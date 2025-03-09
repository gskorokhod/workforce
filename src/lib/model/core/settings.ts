import { getLocalTimeZone, parseDate, today } from "@internationalized/date";
import { z } from "zod";

function dToday() {
  return today(getLocalTimeZone());
}

const settingsSchema = z.object({
  development: z.boolean().default(true),
  askDeleteConfirmation: z.boolean().default(true),
  assignmentMode: z.enum(["simple", "granular"]).default("simple"),
  planningHorizonStart: z.string().default(dToday().toString()).transform(parseDate),
  planningHorizonEnd: z
    .string()
    .default(dToday().add({ months: 1 }).toString())
    .transform(parseDate),
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
      planningHorizonStart: val.planningHorizonStart.toString(),
      planningHorizonEnd: val.planningHorizonEnd.toString(),
    }),
};
