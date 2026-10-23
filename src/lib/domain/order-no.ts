export function formatOrderNo(n: number): string {
  return "#" + n.toString().padStart(6, "0");
}
