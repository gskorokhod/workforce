type MapEntry<K, V> = [K, V];
type Bucket<K, V> = MapEntry<K, V>[];

/**
 * A bucketed hash map that supports deep equality for keys.
 * @template K Key type. Can be any non-nullish type that is supported by the hash and equality functions. (See note below)
 * @template V Value type. Can be any type.
 * @implements {Map}
 *
 * Note: by default, we check if the key has a `hash` method and use it if it does. Otherwise, we use JS built-in `toString` (may be slow).
 * For equality, we check if it has an `equals` or `compare` method and use it if it does. Otherwise, we use `===`.
 * You can bring your own hash and equality functions by passing them to the constructor.
 */
export class HashMap<K, V> implements Map<K, V> {
  readonly _map: Map<string, Bucket<K, V>> = new Map<string, Bucket<K, V>>();
  readonly _hash: (key: K) => string = HashMap.defaultHash;
  readonly _equals: (a: K, b: K) => boolean = HashMap.defaultEquals;
  private _size = 0;

  /**
   * Create a new HashMap.
   * @param iterable Initial key-value pairs to add to the map
   * @param hash Hash function to use for keys.
   * @param equals Equality function to use for keys.
   */
  constructor(
    iterable?: Iterable<readonly [K, V]> | null | undefined,
    hash?: (key: K) => string,
    equals?: (a: K, b: K) => boolean,
  ) {
    if (iterable) {
      for (const item of iterable) {
        this.set(item[0], item[1]);
      }
    }

    if (hash) {
      this._hash = hash;
    }

    if (equals) {
      this._equals = equals;
    }
  }

  toJSON() {
    return this.toMap().toJSON();
  }

  private getEntry(key: K): MapEntry<K, V> | undefined {
    const bucket = this._map.get(this._hash(key));
    if (!bucket) return undefined;

    return bucket.find(([k]) => this._equals(k, key));
  }

  clear(): void {
    this._map.clear();
    this._size = 0;
  }

  delete(key: K): boolean {
    const hash = this._hash(key);

    if (this._map.has(hash)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const bucket = this._map.get(hash)!;
      const index = bucket.findIndex(([k]) => this._equals(k, key));

      if (index !== -1) {
        bucket.splice(index, 1);
        this._size--;
        return true;
      }
    }

    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
    this._map.forEach((bucket) =>
      bucket.forEach(([key, value]) => callbackfn(value, key, this), thisArg),
    );
  }

  get(key: K): V | undefined {
    const entry = this.getEntry(key);
    return entry ? entry[1] : undefined;
  }

  has(key: K): boolean {
    return this.getEntry(key) !== undefined;
  }

  set(key: K, value: V): this {
    const hash = this._hash(key);
    const entry: MapEntry<K, V> = [key, value];

    const bucket = this._map.get(hash) || [];
    const index = bucket.findIndex(([k]) => this._equals(k, key));

    if (index !== -1) {
      bucket[index] = entry;
    } else {
      bucket.push(entry);
      this._size++;
    }

    this._map.set(hash, bucket);
    return this;
  }

  entries(): MapIterator<[K, V]> {
    const it: MapIterator<Bucket<K, V>> = this._map.values();

    function* generator() {
      for (const bucket of it) {
        for (const entry of bucket) {
          yield entry;
        }
      }
    }

    return Iterator.from(generator());
  }

  keys(): MapIterator<K> {
    const it: MapIterator<[K, V]> = this.entries();

    function* generator() {
      for (const entry of it) {
        yield entry[0];
      }
    }

    return Iterator.from(generator());
  }

  values(): MapIterator<V> {
    const it: MapIterator<[K, V]> = this.entries();

    function* generator() {
      for (const entry of it) {
        yield entry[1];
      }
    }

    return Iterator.from(generator());
  }

  toMap(): Map<K, V> {
    return new Map<K, V>(this.entries());
  }

  [Symbol.iterator](): MapIterator<[K, V]> {
    return this.entries();
  }

  [Symbol.toStringTag] = "HashMap";

  get size() {
    return this._size;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static defaultEquals(a: any, b: any): boolean {
    try {
      if (a && typeof a.eq === "function") {
        return a.eq(b);
      }
      if (a && typeof a.equals === "function") {
        return a.equals(b);
      }
      if (a && typeof a.compare === "function") {
        return a.compare(b) === 0;
      }
      return a === b;
    } catch (e) {
      console.warn("Error comparing values:\n", `a = ${a}\n`, `b = ${b}\n`, e);
    }
    return a === b;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static defaultHash(key: any): string {
    try {
      if (key && typeof key.hash === "function") {
        const h = key.hash();
        return String(h);
      }
      if (key && typeof key.hashCode === "function") {
        const h = key.hashCode();
        return String(h);
      }
    } catch (e) {
      console.warn("Error hashing key:\n", `key = ${key}\n`, e);
    }
    return String(key);
  }
}
