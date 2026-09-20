export const BLITZ_SEKUNDEN = 60;

export function blitzBestKey(kategorie: string): string {
  return `blitz-${kategorie}`;
}

export function restSekunden(startMs: number, jetztMs: number, dauer = BLITZ_SEKUNDEN): number {
  const verbraucht = Math.max(0, Math.floor((jetztMs - startMs) / 1000));
  return Math.max(0, dauer - verbraucht);
}

export function blitzVorbei(rest: number): boolean {
  return rest <= 0;
}
