import type { Anlass, Sprecher, Spruch } from '../data/sprueche';

export function spruchKandidaten(
  katalog: readonly Spruch[],
  anlass: Anlass,
  letzterText: string | null = null,
  sprecher?: Sprecher,
): Spruch[] {
  let pool = katalog.filter((s) => s.anlass === anlass);
  if (sprecher) pool = pool.filter((s) => s.sprecher === sprecher);
  const ohneLetzten = pool.filter((s) => s.text !== letzterText);
  return ohneLetzten.length > 0 ? ohneLetzten : pool;
}

export function waehleSpruch(
  katalog: readonly Spruch[],
  anlass: Anlass,
  letzterText: string | null = null,
  sprecher?: Sprecher,
  zufall: () => number = Math.random,
): Spruch {
  const kandidaten = spruchKandidaten(katalog, anlass, letzterText, sprecher);
  if (kandidaten.length === 0) {
    throw new Error(`Kein Spruch für ${anlass}`);
  }
  const index = Math.min(kandidaten.length - 1, Math.floor(zufall() * kandidaten.length));
  return kandidaten[index]!;
}
