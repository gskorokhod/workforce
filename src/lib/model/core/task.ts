import { type Display } from "$lib/ui";
import type { JsonObject } from "type-fest";
import { z } from "zod";
import { type InitialValues } from "./property_values";
import { type State } from "./state";
import { WithProperties } from "./with-properties";

const minSchema = z.object({
  people: z.number().int().nonnegative().default(0),
});

const maxSchema = z.object({
  people: z.number().int().nonnegative().default(Infinity),
});

interface TaskProps extends Display {
  properties?: InitialValues;
  min?: Partial<z.infer<typeof minSchema>>;
  max?: Partial<z.infer<typeof maxSchema>>;
}

export class Task extends WithProperties {
  min: z.infer<typeof minSchema>;
  max: z.infer<typeof maxSchema>;

  constructor(props: TaskProps, state: State, uuid?: string) {
    super(
      {
        ...props,
        template: "task",
      },
      state,
      uuid,
    );
    this.min = minSchema.parse(props.min || {});
    this.max = maxSchema.parse(props.max || {});
  }

  static fromJSON(json: JsonObject, state: State): Task {
    return new Task(
      {
        ...super.fromJSON(json, state),
        min: minSchema.parse(json.min || {}),
        max: maxSchema.parse(json.max || {}),
      },
      state,
      z.optional(z.string()).parse(json.uuid),
    );
  }

  toJSON(): JsonObject {
    return {
      ...super.toJSON(),
      min: this.min,
      max: this.max,
    };
  }

  copy(): Task {
    return new Task(
      {
        ...super.copy(),
        min: this.min,
        max: this.max,
      },
      this.state,
      this.uuid,
    );
  }
}
