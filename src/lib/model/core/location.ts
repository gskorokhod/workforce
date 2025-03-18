import { type Display } from "$lib/ui";
import type { JsonObject } from "type-fest";
import { z } from "zod";
import { Geopoint } from "../geocoding";
import type { InitialValues } from "./property_values";
// import type { State } from "./state";
import { WithProperties } from "./with-properties";

/**
 * Represents the minimum and maximum number of people and tasks that can be assigned to a location.
 */
// interface LocationMinMax {
//   people: number;
//   tasks: number;
// }

const minSchema = z.object({
  people: z.number().int().nonnegative().default(0),
  tasks: z.number().int().nonnegative().default(0),
});

const maxSchema = z.object({
  people: z.number().int().nonnegative().default(Infinity),
  tasks: z.number().int().nonnegative().default(Infinity),
});

interface LocationProps extends Display {
  min?: Partial<z.infer<typeof minSchema>>;
  max?: Partial<z.infer<typeof maxSchema>>;
  point?: Geopoint;
  properties?: InitialValues;
}

/**
 * Represents a location where tasks can be performed.
 */
export class Location extends WithProperties {
  min: z.infer<typeof minSchema>;
  max: z.infer<typeof maxSchema>;
  point?: Geopoint;

  /**
   * Creates a new location.
   * @param props Properties of the location.
   * @param state State to bind the location to.
   * @param uuid UUID of the location. If not provided, a new UUID is generated.
   */
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(props: LocationProps, state: any, uuid?: string) {
    super(
      {
        ...props,
        template: "location",
      },
      state,
      uuid,
    );
    this.point = props.point instanceof Geopoint ? props.point : undefined;
    this.min = minSchema.parse(props.min || {});
    this.max = maxSchema.parse(props.max || {});
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromJSON(json: JsonObject, state: any): Location {
    // console.log("Location.fromJSON");
    return new Location(
      {
        ...super.fromJSON(json, state),
        point: Geopoint.fromJSON(json.point as JsonObject),
        min: minSchema.parse(json.min),
        max: maxSchema.parse(json.max),
      },
      state,
      json.uuid as string,
    );
  }

  toJSON(): JsonObject {
    console.log("Location.toJSON");
    return {
      ...super.toJSON(),
      point: this.point?.toJSON() || null,
      min: this.min,
      max: this.max,
    };
  }

  /**
   * Create a copy of the location.
   * @returns new Location with the same properties as the original.
   */
  copy(): Location {
    return new Location(
      {
        ...super.copy(),
        point: this.point?.copy(),
        min: { ...this.min },
        max: { ...this.max },
      },
      this.state,
      this.uuid,
    );
  }

  // /**
  //  * Get assignments at this location.
  //  * @returns Array of assignments at the location.
  //  */
  // getAssignments(): Assignment[] {
  //   if (!this.state) {
  //     return [];
  //   }
  //   return Assignment.getByLocation(this.state, this);
  // }

  get address(): string {
    return this.point?.address.format() || "";
  }
}
