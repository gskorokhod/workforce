import { z } from "zod";
import { Icon } from "./icon";

export const displaySchema = z.object({
  name: z.string(),
  description: z
    .string()
    .nullish()
    .transform((x) => x ?? undefined),
  icon: Icon.schema.nullish().transform((x) => x ?? undefined),
  avatar: z
    .union([
      z
        .string()
        .url()
        .transform((url) => new URL(url)),
      z.instanceof(URL),
    ])
    .nullish()
    .transform((x) => x ?? undefined),
});

export type Display = z.infer<typeof displaySchema>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isDisplay(obj: any): obj is Display {
  const res = displaySchema.safeParse(obj);
  return res.success;
}

export { Icon };
