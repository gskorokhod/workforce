import { expect, test } from "vitest";
import { HashSet } from "./hashset";

test("Create an empty HashSet", () => {
  const set = new HashSet();
  expect(set.size).toBe(0);
  expect(set.toArray()).toEqual([]);
});

test("Add values", () => {
  const set = new HashSet<string>();
  set.add("one");
  set.add("two");

  expect(set.size).toBe(2);
  expect(set.has("one")).toBe(true);
  expect(set.has("two")).toBe(true);
});

test("Delete a value", () => {
  const set = new HashSet<string>();
  set.add("one");
  set.add("two");

  set.delete("one");

  expect(set.size).toBe(1);
  expect(set.has("one")).toBe(false);
  expect(set.has("two")).toBe(true);
});

test("Iterate over values", () => {
  const expected = ["one", "two"];
  expected.sort();

  const set = new HashSet<string>(expected);

  const collected = [];
  for (const value of set) {
    collected.push(value);
  }
  collected.sort();

  expect(collected).toEqual(expected);
});

test("Clear", () => {
  const set = new HashSet<string>(["one", "two"]);
  set.clear();
  expect(set.size).toBe(0);
  expect(set.toArray()).toEqual([]);
});

test("Set of custom objects", () => {
  const set = new HashSet<Dummy>([new Dummy(1), new Dummy(2)]);

  expect(set.size).toBe(2);
  expect(set.has(new Dummy(1))).toBe(true);
  expect(set.has(new Dummy(2))).toBe(true);
  expect(set.has(new Dummy(3))).toBe(false);
});

// Class that implements equals and hash methods
class Dummy {
  private value: number;

  constructor(value: number) {
    this.value = value;
  }

  equals(other: Dummy): boolean {
    return this.value === other.value;
  }

  hash(): number {
    return 1;
  }
}
