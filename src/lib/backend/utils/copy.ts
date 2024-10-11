export interface Copy<T> {
  copy(): T;
}

export function copyArr<T extends Copy<T>>(arr: T[]): T[] {
  return arr.map((v) => v.copy());
}
