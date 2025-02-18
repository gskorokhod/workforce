import { hasUUID } from "./misc";

export interface Eq<T> {
  eq(other: T): boolean;
}

export function isEq<T>(value: unknown): value is Eq<T> {
  return (
    typeof value === "object" && value !== null && "eq" in value && typeof value.eq === "function"
  );
}

type eqFn<T> = (a: T, b: T) => boolean;

export function eq<T>(a: T, b: T, eq?: eqFn<T>): boolean {
  if (eq !== undefined) {
    return eq(a as T, b as T);
  }
  if (isEq(a) && isEq(b)) {
    return a.eq(b as T);
  }
  if (hasUUID(a) && hasUUID(b)) {
    return a.uuid === b.uuid;
  }
  return a === b;
}

export function has<T>(arr: T[], value: T): boolean {
  return arr.some((v) => eq(v, value));
}

export function hasAll<T>(arr: T[], values: T[]): boolean {
  return values.every((v) => has(arr, v));
}

export function without<T>(arr: T[], value: T): T[] {
  return arr.filter((v) => !eq(v, value));
}

export function indexOf<T>(arr: T[], value: T): number {
  return arr.findIndex((v) => eq(v, value));
}

export function arrEq<T>(arr1: T[], arr2: T[]): boolean {
  return arr1.length === arr2.length && arr1.every((v, i) => eq(v, arr2[i]));
}
