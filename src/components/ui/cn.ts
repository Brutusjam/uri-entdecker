export function cn(...teile: Array<string | false | null | undefined>): string {
  return teile.filter(Boolean).join(' ');
}
