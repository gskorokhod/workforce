import { expect, test } from "vitest";
import { HashMap } from "./hashmap";

test("Create an empty HashMap", () => {
  const map = new HashMap();
  expect(map.size).toBe(0);
  expect(map.keys().toArray()).toEqual([]);
  expect(map.values().toArray()).toEqual([]);
  expect(map.entries().toArray()).toEqual([]);
});

test("Set and get values", () => {
  const map = new HashMap<string, number>();
  map.set("one", 1);
  map.set("two", 2);

  expect(map.size).toBe(2);
  expect(map.get("one")).toBe(1);
  expect(map.get("two")).toBe(2);

  map.set("one", 3);
  expect(map.size).toBe(2);
  expect(map.get("one")).toBe(3);
  expect(map.get("two")).toBe(2);
});

test("Delete a key", () => {
  const map = new HashMap<string, number>();
  map.set("one", 1);
  map.set("two", 2);

  map.delete("one");
  expect(map.size).toBe(1);
  expect(map.get("one")).toBeUndefined();
  expect(map.get("two")).toBe(2);
});

test("Iterate over keys", () => {
  const map = new HashMap<string, number>();
  map.set("one", 1);
  map.set("two", 2);

  const expected = ["one", "two"];
  expected.sort();

  const keys = map.keys().toArray().sort();
  expect(keys).toEqual(expected);
});

test("Iterate over values", () => {
  const map = new HashMap<string, number>();
  map.set("one", 1);
  map.set("two", 2);

  const expected = [1, 2];
  const values = map.values().toArray().sort();
  expect(values).toEqual(expected);
});

test("Iterate over entries", () => {
  const map = new HashMap<string, number>();
  map.set("one", 1);
  map.set("two", 2);

  const expected = [
    ["one", 1],
    ["two", 2],
  ] as [string, number][];
  expected.sort();

  const entries = map.entries().toArray().sort();
  expect(entries).toEqual(expected);
});

test("Create a HashMap with initial values", () => {
  const map = new HashMap([
    [1, "one"],
    [2, "two"],
    [3, "three"],
  ]);

  expect(map.size).toBe(3);
  expect(map.get(1)).toBe("one");
  expect(map.get(2)).toBe("two");
  expect(map.get(3)).toBe("three");
});

test("Class instances as keys", () => {
  const map = new HashMap<GoodDummy, string>();

  map.set(new GoodDummy(1), "one");
  map.set(new GoodDummy(2), "two");

  expect(map.size).toBe(2);
  expect(map.get(new GoodDummy(1))).toBe("one");
  expect(map.get(new GoodDummy(2))).toBe("two");

  map.set(new GoodDummy(1), "three");
  expect(map.size).toBe(2);
  expect(map.get(new GoodDummy(1))).toBe("three");
  expect(map.get(new GoodDummy(2))).toBe("two");

  map.delete(new GoodDummy(1));
  expect(map.size).toBe(1);
  expect(map.get(new GoodDummy(1))).toBeUndefined();
  expect(map.get(new GoodDummy(2))).toBe("two");
});

test("Class instances as keys without equals and hash", () => {
  const map = new HashMap<BadDummy, string>();

  map.set(new BadDummy(1), "one");
  map.set(new BadDummy(2), "two");

  expect(map.size).toBe(2);
  expect(map.get(new BadDummy(1))).toBeUndefined();
  expect(map.get(new BadDummy(2))).toBeUndefined();
});

// Class that implements equals and hash methods
class GoodDummy {
  private value: number;

  constructor(value: number) {
    this.value = value;
  }

  equals(other: GoodDummy): boolean {
    return this.value === other.value;
  }

  hash(): number {
    return 1;
  }
}

// Class that does not implement equals and hash methods
class BadDummy {
  private value: number;

  constructor(value: number) {
    this.value = value;
  }
}
