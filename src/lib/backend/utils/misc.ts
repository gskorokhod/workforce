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
