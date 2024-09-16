import type { JsonValue } from "type-fest";
import { v4 as uuidv4 } from "uuid";
import { type Copy, type Eq } from "../utils";
import type { State } from "./state";

/**
 * Base class for all business logic objects in the application.
 * Provides methods for serialization, copying, and state management.
 *
 * Warning: to implement the commit / update semantics, objects are copied.
 * This means that the standard JS equality operator will not work as expected.
 * Use the `eq` method to compare objects.
 */
export abstract class Base implements Copy<Base>, Eq<Base> {
  readonly uuid: string;
  protected _state?: State;
  protected _timestamp: number;

  constructor(state?: State, uuid?: string) {
    this.uuid = uuid || uuidv4();
    this._state = state;
    this._timestamp = Date.now();
  }

  /**
   * Convert the object to a JSON value for serialization.
   */
  abstract toJSON(): JsonValue;

  /**
   * Create a deep copy of the object.
   */
  abstract copy(): Base;

  /**
   * Get the objects that this object depends on.
   */
  abstract dependencies(): Base[];

  /**
   * Handle a dependency being removed from the state
   * @param dep Dependency to remove
   */
  abstract removeDependency(dep: Base): void;

  /**
   * Update the object with the current value from the state.
   * If the object is not bound to a state, this method will do nothing.
   * @returns True if local state has been updated, false otherwise. If the object is not bound to a state or doesn't exist there, always returns false.
   */
  update(force: boolean = false): boolean {
    if (!this._state) {
      return false;
    }

    const obj = this.get();
    if (!obj) {
      console.warn(`Trying to update object ${this.uuid}, but it does not exist in the state`);
      return false;
    }

    if (force || this.stale) {
      this._timestamp = obj._timestamp;
      return true;
    }

    return false;
  }

  /**
   * Update the state with the object's current value
   * If the object is not bound to a state, this method will do nothing.
   * @return True if bound state has been updated
   */
  commit(force: boolean = false): boolean {
    if (!this._state) {
      console.warn(`Trying to commit object ${this.uuid}, but it is not bound to a State!`);
      return false;
    }

    let updated = false;
    if (force || this.fresh) {
      this._state.put(this);
      updated = true;
    }

    this.dependencies().forEach((dep) => {
      dep._state = this._state;
      updated = dep.commit() || updated;
    });

    return updated;
  }

  /**
   * Delete the object from the state it is bound to, and unbind the object from the state.
   * @return True on success, false if the object was not bound to a state
   */
  delete(): boolean {
    if (this._state) {
      this._state.delete(this);
      this._state = undefined;
      return true;
    }
    return false;
  }

  /**
   * Check if this object is equal to another object
   * @param other Object to compare to
   * @returns True if the objects are equal, false otherwise
   */
  eq(other: Base): boolean {
    return this.uuid === other.uuid;
  }

  /**
   * Update the object's timestamp to the current time
   */
  touch(): void {
    this._timestamp = Date.now();
  }

  /**
   * Get this object's corresponding copy in the global state
   * @returns That object, or undefined if it doesn't exist
   */
  protected get(): Base | undefined {
    return this._state?.get(this.uuid);
  }

  /**
   * Get the timestamp of this object
   */
  get timestamp(): number {
    return this._timestamp;
  }

  /**
   * Get the state this object is bound to
   */
  get state(): State | undefined {
    return this._state;
  }

  /**
   * Check if the global state has an older copy of this object
   */
  get fresh(): boolean {
    const obj = this.get();
    return obj === undefined || obj._timestamp <= this._timestamp;
  }

  /**
   * Check if the global state has a newer copy of this object
   */
  get stale(): boolean {
    const obj = this.get();
    return obj !== undefined && obj._timestamp > this._timestamp;
  }

  /**
   * Set the state this object is bound to
   */
  set state(state: State | undefined) {
    this._state = state;
  }
}
