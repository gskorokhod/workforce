import { type PropertyType } from "$lib/model/core/property";

export function describeType(v: PropertyType) {
  switch (v) {
    case "single":
      return "Single-Select";
    case "multiple":
      return "Multi-Select";
    case "text":
      return "Text Field";
    default:
      return "Unknown";
  }
}
