import { type Display } from "$lib/ui";
import { CalendarDate, parseDate } from "@internationalized/date";
import { get as _get } from "svelte/store";
import type { JsonObject } from "type-fest";
import { z } from "zod";
import { type InitialValues } from "./property_values";
import type { State } from "./state";
import { WithProperties } from "./with-properties";

interface PersonProps extends Display {
  email?: string;
  dob?: CalendarDate;
  properties?: InitialValues;
}

export class Person extends WithProperties {
  email?: string;
  dob?: CalendarDate;

  constructor(props: PersonProps, state: State, uuid?: string) {
    super(
      {
        ...props,
        template: "person",
      },
      state,
      uuid,
    );
    this.email = props.email;
    this.dob = props.dob;
  }

  static fromJSON(json: JsonObject, state: State): Person {
    return new Person(
      {
        ...super.fromJSON(json, state),
        email: z
          .string()
          .nullish()
          .transform((x) => x ?? undefined)
          .parse(json.email),
        dob: z
          .string()
          .transform(parseDate)
          .nullish()
          .transform((x) => x ?? undefined)
          .parse(json.dob),
      },
      state,
      z.optional(z.string()).parse(json.uuid),
    );
  }

  toJSON(): JsonObject {
    return {
      ...super.toJSON(),
      email: this.email ?? null,
      dob: this.dob?.toString() ?? null,
    };
  }

  copy(): Person {
    return new Person(
      {
        ...super.copy(),
        email: this.email,
        dob: this.dob?.copy(),
      },
      this.state,
      this.uuid,
    );
  }
}
