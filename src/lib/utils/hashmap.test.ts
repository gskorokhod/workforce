import { expect, test } from "vitest";
import { HashMap } from "./hashmap";

test("Create an empty HashMap", () => {
  const map = new HashMap();
  expect(map.size).toBe(0);
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

test("Delete a key", () => {
  const map = new HashMap();
  const key = { a: 1 };

  map.set(key, "value1");
  expect(map.size).toBe(1);

  map.delete(key);
  expect(map.size).toBe(0);
  expect(map.get(key)).toBeUndefined();
});

test("Overwrite a key", () => {
  const map = new HashMap();
  const key = { a: 1 };

  map.set(key, "value1");
  expect(map.size).toBe(1);
  expect(map.get(key)).toBe("value1");

  map.set(key, "value2");
  expect(map.size).toBe(1);
  expect(map.get(key)).toBe("value2");
});

test("Add a key-value pair", () => {
  const map = new HashMap<object, string>([[{ a: 1 }, "value1"]]);

  map.set({ b: 2 }, "value2");
  expect(map.size).toBe(2);
  expect(map.get({ a: 1 })).toBe("value1");
  expect(map.get({ b: 2 })).toBe("value2");
});

test("Check if a key exists", () => {
  const map = new HashMap();
  const key = { a: 1 };

  map.set(key, "value1");
  expect(map.has(key)).toBe(true);

  map.delete(key);
  expect(map.has(key)).toBe(false);
});

test("Clear the HashMap", () => {
  const map = new HashMap();
  map.set({ a: 1 }, "value1");
  map.set({ b: 2 }, "value2");
  expect(map.size).toBe(2);
  map.clear();
  expect(map.size).toBe(0);
  expect(map.get({ a: 1 })).toBeUndefined();
  expect(map.get({ b: 2 })).toBeUndefined();
});

test("Iterate over entries", () => {
  const map = new HashMap([
    [{ a: 1 }, "value1"],
    [{ b: 2 }, "value2"],
  ]);
  const entries = Array.from(map.entries());
  expect(entries).toHaveLength(2);
  expect(entries).toContainEqual([{ a: 1 }, "value1"]);
  expect(entries).toContainEqual([{ b: 2 }, "value2"]);
});

test("Iterate over keys", () => {
  const map = new HashMap([
    [{ a: 1 }, "value1"],
    [{ b: 2 }, "value2"],
  ]);
  const keys = Array.from(map.keys());
  expect(keys).toHaveLength(2);
  expect(keys).toContainEqual({ a: 1 });
  expect(keys).toContainEqual({ b: 2 });
});

test("Iterate over values", () => {
  const map = new HashMap([
    [{ a: 1 }, "value1"],
    [{ b: 2 }, "value2"],
  ]);
  const values = Array.from(map.values());
  expect(values).toHaveLength(2);
  expect(values).toContain("value1");
  expect(values).toContain("value2");
});

test("Check size property", () => {
  const map = new HashMap();
  expect(map.size).toBe(0);
  map.set({ a: 1 }, "value1");
  expect(map.size).toBe(1);
  map.set({ b: 2 }, "value2");
  expect(map.size).toBe(2);
  map.delete({ a: 1 });
  expect(map.size).toBe(1);
});

test("Hash collisions", () => {
  const badhash = () => "foo";
  const map = new HashMap<string, string>(undefined, badhash);

  // The hash function is bad, so all keys will have the same hash
  map.set("spam", "spam");
  map.set("eggs", "eggs");

  // ...but the keys are different, so they should still be stored and retrieved correctly
  expect(map.size).toBe(2);
  expect(map.get("spam")).toBe("spam");
  expect(map.get("eggs")).toBe("eggs");

  map.set("eggs", "new eggs");
  expect(map.size).toBe(2);
  expect(map.get("eggs")).toBe("new eggs");

  map.delete("eggs");
  expect(map.size).toBe(1);
  expect(map.get("eggs")).toBeUndefined();
});

test("Custom equals function", () => {
  const badhash = () => "foo";
  const equals = (a: string, b: string) => a.length === b.length;

  const map = new HashMap<string, string>(undefined, badhash, equals);

  map.set("spam", "spam");

  expect(map.size).toBe(1);
  expect(map.get("spam")).toBe("spam");

  map.set("eggs", "eggs");

  // The hashes match, and the keys are equal (by length)
  expect(map.size).toBe(1);
  expect(map.get("eggs")).toBe("eggs");
});

test("Deep equality for keys", () => {
  const key1 = { a: 1, b: { c: 2 } };
  const map = new HashMap<object, string>();

  map.set(key1, "value1");
  expect(map.size).toBe(1);
  expect(map.get(key1)).toBe("value1");

  // The key is not the same object, but it has the same structure
  expect(map.get({ a: 1, b: { c: 2 } })).toBe("value1");

  // This key would be equal by shallow equality, but actually has a different structure
  expect(map.get({ a: 1, b: { c: 3 } })).toBeUndefined();
});
