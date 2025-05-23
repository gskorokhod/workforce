import { type Display } from "$lib/ui";
import { get as _get, type Writable } from "svelte/store";
import type { JsonObject } from "type-fest";
import { z } from "zod";
import { Displayable } from "./displayable";
import { PropertyValues, type InitialValues } from "./property_values";
//import { type State } from "./state";
import { type Templates } from "./templates";

export interface WithPropertiesProps extends Display {
  template: keyof Templates;
  properties?: InitialValues;
}

export class WithProperties extends Displayable {
  readonly template: keyof Templates;
  readonly properties: PropertyValues;

  // Can't import State due to circular dependency. Using any until I figure out a better way.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(props: WithPropertiesProps, state: any, uuid?: string) {
    // console.log("WithProperties constructor", props);
    super(props, state, uuid);
    this.template = props.template;
    this.properties = _get(state.templates as Writable<Templates>)[props.template].copy();
    if (props.properties) {
      this.properties.putAll(props.properties);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromJSON(json: JsonObject, state: any): WithProperties {
    // console.log("WithProperties fromJSON");
    return new WithProperties(
      {
        ...super.fromJSON(json, state),
        template: z
          .string()
          .refine((t) => t in _get(state.templates as Writable<Templates>), {
            message: "Invalid template",
          })
          .parse(json.template) as keyof Templates,
        properties: PropertyValues.fromJSON(json.properties, state).entries,
      },
      state,
      z.optional(z.string()).parse(json.uuid),
    );
  }

  toJSON(): JsonObject {
    // console.log("WithProperties toJSON");
    return {
      ...super.toJSON(),
      template: this.template,
      properties: this.properties.toJSON(),
    };
  }

  copy(): WithProperties {
    return new WithProperties(
      {
        ...super.copy(),
        template: this.template,
        properties: this.properties,
      },
      this.state,
      this.uuid,
    );
  }
}
