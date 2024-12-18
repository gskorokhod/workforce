import { type Copy, type Eq } from "$lib/utils";
import type { JsonObject } from "type-fest";
import { v4 as uuidv4 } from "uuid";
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
  state?: State;

  constructor(state?: State, uuid?: string) {
    this.uuid = uuid || uuidv4();
    this.state = state;
  }

  /**
   * Convert the object to a JSON value for serialization.
   */
  abstract toJSON(): JsonObject;

  /**
   * Create a deep copy of the object.
   */
  abstract copy(): Base;

  /**
   * Add or update the object in the state it is bound to.
   */
  put() {
    if (this.state) {
      this.state.put(this);
    }
  }

  /**
   * Delete the object from the state it is bound to, and unbind the object from the state.
   * @return True on success, false if the object was not bound to a state
   */
  delete(): boolean {
    if (this.state) {
      this.state.delete(this);
      this.state = undefined;
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
   * Get this object's corresponding copy in the global state
   * @returns That object, or undefined if it doesn't exist
   */
  get(): Base | undefined {
    if (!this.state) return this;
    return this.state?.get(this.uuid);
  }
}
