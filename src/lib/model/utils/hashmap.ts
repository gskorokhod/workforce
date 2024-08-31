import objectHash from "object-hash";
import { isDeepStrictEqual } from "util";

// We are importing it to use in documentation (via "@see")
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { deepStrictEqual as _deepStrictEqual } from "assert";

type MapEntry<K, V> = [K, V];
type Bucket<K, V> = MapEntry<K, V>[];

/**
 * A bucketed hash map that supports deep equality for keys.
 * @template K Key type. Can be any non-nullish type that is supported by the hash and equality functions. (See note below)
 * @template V Value type. Can be any type.
 * @implements {Map}
 *
 * Note: the default hash function uses SHA-1 (object-hash implementation) and the default equality function uses `assert.deepStrictEqual`.
 * These should support most types, but if not, you can provide your own hash and equality functions.
 *
 * @see _deepStrictEqual
 * @see objectHash
 */
export class HashMap<K extends objectHash.NotUndefined, V> implements Map<K, V> {
  private _map: Map<string, Bucket<K, V>> = new Map<string, Bucket<K, V>>();
  private _hash: (key: K) => string = objectHash.sha1;
  private _equals: (a: K, b: K) => boolean = isDeepStrictEqual;
  private _size: number = 0;

  /**
   * Create a new HashMap.
   * @param iterable Initial key-value pairs to add to the map
   * @param hash Hash function to use for keys. Defaults to SHA-1 (object-hash implementation).
   * @param equals Equality function to use for keys. Defaults to `assert.deepStrictEqual`.
   */
  constructor(
    iterable?: Iterable<readonly [K, V]> | null | undefined,
    hash?: (key: K) => string,
    equals?: (a: K, b: K) => boolean
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
      bucket.forEach(([key, value]) => callbackfn(value, key, this), thisArg)
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

  entries(): IterableIterator<[K, V]> {
    const it: IterableIterator<Bucket<K, V>> = this._map.values();
    let bucket: IteratorResult<Bucket<K, V>> | undefined = undefined;
    let index = 0;

    return {
      [Symbol.iterator]() {
        return this;
      },
      next() {
        if (!bucket) {
          bucket = it.next();
          index = 0;
        }

        if (!bucket.done) {
          const entry = bucket.value[index];
          index++;

          if (index >= bucket.value.length) {
            bucket = undefined;
          }

          return {
            done: false,
            value: entry
          };
        }

        return { done: true, value: undefined };
      }
    };
  }

  keys(): IterableIterator<K> {
    const it: IterableIterator<[K, V]> = this.entries();

    return {
      [Symbol.iterator]() {
        return this;
      },
      next() {
        const next = it.next();
        return {
          done: next.done,
          value: next.value ? next.value[0] : undefined
        };
      }
    };
  }

  values(): IterableIterator<V> {
    const it: IterableIterator<[K, V]> = this.entries();

    return {
      [Symbol.iterator]() {
        return this;
      },
      next() {
        const next = it.next();
        return {
          done: next.done,
          value: next.value ? next.value[1] : undefined
        };
      }
    };
  }

  toMap(): Map<K, V> {
    return new Map<K, V>(this.entries());
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries();
  }

  [Symbol.toStringTag]: string = "HashMap";

  get size() {
    return this._size;
  }
}
