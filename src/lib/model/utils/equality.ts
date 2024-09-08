export interface Eq<T> {
  eq(other: T): boolean;
}

export function has<T extends Eq<T>>(arr: T[], value: T): boolean {
  return arr.some((v) => v.eq(value));
}

export function without<T extends Eq<T>>(arr: T[], value: T): T[] {
  return arr.filter((v) => !v.eq(value));
}

export function indexOf<T extends Eq<T>>(arr: T[], value: T): number {
  return arr.findIndex((v) => v.eq(value));
}

export function arrEq<T extends Eq<T>>(arr1: T[], arr2: T[]): boolean {
  return arr1.length === arr2.length && arr1.every((v, i) => v.eq(arr2[i]));
}
