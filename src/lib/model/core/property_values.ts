import { type Readable, type Writable, get as _get, derived, writable } from "svelte/store";
import type { JsonObject, JsonValue } from "type-fest";
import { z } from "zod";
import { type IdOr, uuidOf } from "./misc";
import { Property } from "./property";
import type { State } from "./state";

export type InitialValues = Iterable<[IdOr<Property<unknown>>, unknown | null]>;

export interface PropertyValuesProps {
  state: State;
  values?: InitialValues;
}

export class PropertyValues {
  private _values: Writable<Map<string, unknown | null>> = writable(new Map());
  private _state: State;

  constructor(props: PropertyValuesProps) {
    this._state = props.state;
    if (props.values) {
      this.putAll(props.values);
    }
  }

  static fromJSON(json: JsonValue, state: State): PropertyValues {
    console.log("PropertyValues.fromJSON", json);
    const obj = z.object({
      values: z
        .array(
          z.tuple([
            z.string().transform((uuid) => _get(state._properties).get(uuid) as Property<unknown>),
            z.unknown().nullable(),
          ]),
        )
        .optional(),
    });

    console.log("PropertyValues.fromJSON - parsed", obj);
    const parsed = obj.parse(json);

    const propertyValues = new PropertyValues({ state });
    if (parsed.values) {
      for (const [property, value] of parsed.values) {
        if (value !== null) {
          // Parse the value through the property to ensure correct deserialization
          const result = property.parse(value);
          console.log("PropertyValues.fromJSON - parsed value for " + property.uuid, result);
          if (result.success) {
            propertyValues.put(property, result.data);
          }
        } else {
          propertyValues.put(property, null);
        }
      }
    }

    return propertyValues;
  }

  toJSON(): JsonObject {
    console.log("PropertyValues.toJSON");
    return {
      values: this.keys.map((p) => {
        const val = this.get(p);
        return [p.uuid, val === null ? null : p.serialize(val)];
      }),
    };
  }

  copy(): PropertyValues {
    return PropertyValues.fromJSON(this.toJSON(), this._state);
  }

  putAll(values: InitialValues) {
    for (const [property, value] of values) {
      this.put(property, value);
    }
  }

  put<T>(property: IdOr<Property<T>>, value?: unknown) {
    console.log("PropertyValues.put", property, value);
    const id = uuidOf(property);
    const props = _get(this._state._properties);
    if (!props.has(id)) {
      if (property instanceof Property) {
        console.warn("Property did not exist, adding it to the state: ", property);
        this._state.put(property);
      } else {
        throw new Error("Property does not exist: " + id);
      }
    }

    if (value === null || value === undefined) {
      console.warn("PropertyValues.put: Null value", id);
      this._values.update((values) => {
        values.set(id, null);
        return values;
      });
      return;
    }

    const prop = props.get(id) as Property<T>;
    const res = prop.parse(value);
    if (!res.success) {
      //throw new Error(`Invalid value: ${res.error.message}`);
      console.warn(`Invalid value: ${res.error.message}`);
    }

    this._values.update((values) => {
      console.log("PropertyValues.put: Setting value", id, value);
      values.set(id, res.data);
      return values;
    });
  }

  delete<T>(property: IdOr<Property<T>>): void {
    this._values.update((values) => {
      values.delete(uuidOf(property));
      return values;
    });
  }

  get<T>(property: IdOr<Property<T>>): T | undefined | null {
    return _get(this.rGet(property));
  }

  rGet<T>(property: IdOr<Property<T>>): Readable<T | undefined | null> {
    return derived([this._state._properties, this._values], ([properties, values]) => {
      const id = uuidOf(property);
      if (!(properties.has(id) && values.has(id))) {
        console.warn("PropertyValues.get: Property not found", id);
        return undefined;
      }

      const prop = properties.get(id) as Property<T>;
      const value = values.get(id);
      if (value === null) {
        console.warn("PropertyValues.get: Null value", id);
        return null;
      }
      const parsed = prop.parse(value);
      return parsed.success ? parsed.data : undefined;
    });
  }

  get keys(): Property<unknown>[] {
    return _get(this.rKeys);
  }

  get rKeys(): Readable<Property<unknown>[]> {
    return derived([this._state._properties, this._values], ([properties, values]) => {
      return Array.from(values.keys())
        .map((id) => properties.get(id))
        .filter((p): p is Property<unknown> => p !== undefined);
    });
  }

  get entries(): [Property<unknown>, unknown | null][] {
    return _get(this.rEntries);
  }

  get rEntries(): Readable<[Property<unknown>, unknown | null][]> {
    return derived([this.rKeys, this._values], ([keys, values]) => {
      return keys.map((key) => [key, values.get(uuidOf(key))]) as [
        Property<unknown>,
        unknown | null,
      ][];
    });
  }

  [Symbol.iterator](): IterableIterator<[Property<unknown>, unknown | null]> {
    return this.entries[Symbol.iterator]();
  }
}
