export function getInitials(name: string): string {
  if (name.length === 0) return "N/A";

  if (name.length <= 3) return name.toUpperCase();

  return name
    .split(" ")
    .filter((s) => s.length > 0)
    .map((n) => n[0].toUpperCase())
    .join("");
}
