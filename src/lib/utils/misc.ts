import Color from "color";

export function getInitials(name: string): string {
  if (name.length === 0) return "N/A";

  if (name.length <= 3) return name.toUpperCase();

  return name
    .split(" ")
    .filter((s) => s.length > 0)
    .map((n) => n[0].toUpperCase())
    .join("");
}

export function lstrip(s: string, substr: string): string {
  if (substr.length === 0 || s.length === 0) return s;
  while (s.startsWith(substr)) {
    s = s.slice(substr.length);
  }
  return s;
}

/**
 * Convert the first letter of a string to uppercase
 * @param s the string to capitalize
 */
export function capitalize(s: string) {
  if (s.length === 0) return s;
  if (s.length === 1) return s.toUpperCase();
  return s[0].toUpperCase() + s.slice(1);
}

export function debounce<T extends (...args: unknown[]) => void>(callback: T, wait = 300) {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>): void => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      callback(...args);
    }, wait);
  };
}

export function noUndefined<T extends object>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

export function randomColor(): Color {
  return Color.rgb(Math.random() * 255, Math.random() * 255, Math.random() * 255);
}
