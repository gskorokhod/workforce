import { Location, State } from "$lib/model";
import { Geopoint, type LngLat } from "$lib/model/geocoding";
import { Address } from "$lib/model/geocoding/types/address";
import { faker } from "@faker-js/faker";
import { sample, select } from "./misc";
import { get } from "svelte/store";

const NAMES = ["Office", "Hospital", "Building", "Ward", "Unit"];

const LONDON: [number, number] = [51.5074, -0.1278];

function mkSuffix(): string {
  if (Math.random() < 0.5) {
    return "";
  } else {
    if (Math.random() < 0.5) {
      return Math.floor(Math.random() * 10).toString();
    } else {
      return select(["A", "B", "C", "D", "E"]);
    }
  }
}

function mkName(): string {
  return `${select(NAMES)} ${mkSuffix()}`;
}

function mkCoords(): LngLat {
  const [lat, lon] = faker.location.nearbyGPSCoordinate({
    origin: LONDON,
    radius: 1000
  });
  return [lon, lat];
}

export async function generateTrueLocation(state?: State): Promise<Location> {
  const point = await Geopoint.fromCoords(mkCoords());
  const name = mkName();
  const avatar = new URL(faker.image.avatar());
  const max = {
    people: faker.number.int({ min: 2, max: 10 }),
    tasks: faker.number.int({ min: 1, max: 3 })
  };
  return new Location(
    {
      name,
      point,
      max,
      avatar
    },
    state
  );
}

export function generateLocation(state?: State): Location {
  const point = new Geopoint(
    mkCoords(),
    new Address({
      settlement: "London",
      country: "United Kingdom",
      street: faker.location.street(),
      building: mkName(),
      postalCode: faker.location.zipCode()
    })
  );

  const name = mkName();
  const avatar = new URL(faker.image.avatar());
  const max = {
    people: faker.number.int({ min: 2, max: 10 }),
    tasks: faker.number.int({ min: 1, max: 3 })
  };
  return new Location(
    {
      name,
      point,
      max,
      avatar
    },
    state
  );
}

export function sampleLocations(state: State, n: number, max?: number): Location[] {
  if (max && max > n) {
    n = faker.number.int({ min: n, max: max });
  }

  const locations = get(state.locations);

  let missing = n - locations.length;
  while (missing > 0) {
    state.put(generateLocation(state));
    missing--;
  }

  return sample(get(state.locations), n);
}

export function generateLocations(n: number, max?: number, state?: State): Location[] {
  if (max && max > n) {
    n = faker.number.int({ min: n, max: max });
  }
  return Array.from({ length: n }, () => generateLocation(state));
}

export async function generateTrueLocations(
  n: number,
  max?: number,
  state?: State
): Promise<Location[]> {
  if (max && max > n) {
    n = faker.number.int({ min: n, max: max });
  }
  return Promise.all(Array.from({ length: n }, () => generateTrueLocation(state)));
}
