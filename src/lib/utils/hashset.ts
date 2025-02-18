import { HashMap } from "./hashmap";

export class HashSet<T> {
  private _map: HashMap<T, null>;

  /**
   * Create a new Set.
   * @param iterable Initial values to add to the set
   * @param hash Hash function to use for values.
   * @param equals Equality function to use for values.
   */
  constructor(
    iterable?: Iterable<T> | null | undefined,
    hash?: (key: T) => string,
    equals?: (a: T, b: T) => boolean,
  ) {
    this._map = new HashMap<T, null>(null, hash, equals);
    if (iterable) {
      for (const item of iterable) {
        this.add(item);
      }
    }
  }

  add(value: T) {
    this._map.set(value, null);
  }

  has(value: T): boolean {
    return this._map.has(value);
  }

  delete(value: T): boolean {
    return this._map.delete(value);
  }

  clear(): void {
    this._map.clear();
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this._map.keys();
  }

  values(): SetIterator<T> {
    return this._map.keys();
  }

  keys(): SetIterator<T> {
    return this._map.keys();
  }

  intersection(other: HashSet<T>): HashSet<T> {
    const ans = new HashSet<T>();
    for (const value of this) {
      if (other.has(value)) {
        ans.add(value);
      }
    }
    return ans;
  }

  union(other: HashSet<T>): HashSet<T> {
    return new HashSet<T>([...this, ...other], this._map._hash, this._map._equals);
  }

  difference(other: HashSet<T>): HashSet<T> {
    const ans = new HashSet<T>();
    for (const value of this) {
      if (!other.has(value)) {
        ans.add(value);
      }
    }
    return ans;
  }

  intersectsWith(other: HashSet<T>): boolean {
    for (const value of this) {
      if (other.has(value)) {
        return true;
      }
    }
    return false;
  }

  isSubsetOf(other: HashSet<T>): boolean {
    for (const value of this) {
      if (!other.has(value)) {
        return false;
      }
    }
    return true;
  }

  isSupersetOf(other: HashSet<T>): boolean {
    return other.isSubsetOf(this);
  }

  isDisjointFrom(other: HashSet<T>): boolean {
    return !this.intersectsWith(other);
  }

  toArray(): T[] {
    return Array.from(this.values());
  }

  get size(): number {
    return this._map.size;
  }
}
