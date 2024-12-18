import ColumnHideSelector from "./column-hide-selector.svelte";
import TableHeader from "./table-header.svelte";

export function mkCapacity(min?: number, max?: number, title?: string) {
  if (min) {
    if (max) {
      return `${min} - ${max} ${title}`;
    }
    return `${min}+ ${title}`;
  }

  if (max && max !== Infinity) {
    return `${max} ${title}`;
  }

  return "No Limit";
}

export { ColumnHideSelector, TableHeader };
