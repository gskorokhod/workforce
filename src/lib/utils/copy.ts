export interface Copy<T> {
  copy(): T;
}

export function copyArr<T extends Copy<T>>(arr: Iterable<T>): T[] {
  const ans = [];
  for (const item of arr) {
    ans.push(item.copy());
  }
  return ans;
}
