import { Type } from "$lib/types/index.ts";
import { v4 as uuidv4 } from "uuid";

export type LngLat = [number, number];

export interface LocationProps {
  address: string;
  coordinates: LngLat;
  image_url: string;
  name: string;
}

export interface Location extends LocationProps {
  type: Type.Location;
  uuid: string;
}

export function createLocation(props: LocationProps): Location {
  return {
    type: Type.Location,
    uuid: uuidv4(),
    ...props
  };
}

export function defaultLocationProps(): LocationProps {
  return {
    address: "",
    coordinates: [0, 0],
    image_url: "",
    name: ""
  };
}
