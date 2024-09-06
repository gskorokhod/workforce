import { describe, expect, it } from "vitest";
import type { LngLat } from ".";
import { Geopoint } from "./geopoint";
import { Address } from "./types/address";

const BMS = {
  coords: [-2.7937796763083123, 56.3379613],
  address: {
    space: "",
    building: "Bute Medical School",
    street: "Westburn Lane",
    settlement: "St Andrews",
    municipality: "Fife",
    state: "Scotland",
    country: "United Kingdom",
    postcode: "KY16 9TP"
  }
};

const Pharmacy = {
  coords: [-2.797737, 56.3404602],
  address: {
    space: "",
    building: "135",
    street: "Market Street",
    settlement: "St Andrews",
    municipality: "Fife",
    state: "Scotland",
    country: "United Kingdom",
    postcode: "KY16 9PF"
  }
};

describe("Geopoint", () => {
  it("Should geocode a set of coordinates", async () => {
    const geopoint = await Geopoint.fromCoords(BMS.coords as LngLat);
    expect(geopoint).toBeDefined();
    expect(geopoint?.coords).toEqual(BMS.coords);
    expect(geopoint?.address).toEqual(BMS.address);
  });

  it("Should look up an address", async () => {
    const address = new Address(BMS.address);
    const geopoint = await Geopoint.fromAddress(address);
    expect(geopoint).toBeDefined();
    expect(geopoint?.coords).toEqual(BMS.coords);
    expect(geopoint?.address).toEqual(BMS.address);
  });

  it("Should serialize and deserialize a Geopoint", () => {
    const geopoint = new Geopoint(BMS.coords as LngLat, new Address(BMS.address));

    const json = geopoint.toJSON();
    const stringified = JSON.stringify(json);
    const parsed = JSON.parse(stringified);
    const deserialized = Geopoint.fromJSON(parsed);

    expect(deserialized).toBeDefined();
    expect(deserialized?.coords).toEqual(geopoint.coords);
    expect(deserialized?.address).toEqual(geopoint.address);
  });

  it("Should format an address", async () => {
    const geopoint = await Geopoint.fromCoords(Pharmacy.coords as LngLat);
    expect(geopoint).toBeDefined();
    const formatted = geopoint?.address.format();
    expect(formatted).toEqual(
      "135, Market Street, St Andrews, Fife, Scotland, KY16 9PF, United Kingdom"
    );
  });
});
