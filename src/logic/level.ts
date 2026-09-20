export const XP_PRO_RICHTIG = 10;

export const LEVEL: { xp: number; titel: string }[] = [
  { xp: 0, titel: 'Wanderin' },
  { xp: 50, titel: 'Alphirtin' },
  { xp: 150, titel: 'Bergführerin' },
  { xp: 350, titel: 'Gipfelstürmerin' },
  { xp: 700, titel: 'Urner Landammann' },
];

export function levelVonXp(xp: number): { stufe: number; titel: string; xp: number; naechstesXp: number | null } {
  const sicher = Math.max(0, xp);
  let aktuell = LEVEL[0]!;
  let stufe = 0;
  for (let i = 0; i < LEVEL.length; i++) {
    const kandidat = LEVEL[i]!;
    if (sicher >= kandidat.xp) {
      aktuell = kandidat;
      stufe = i;
    }
  }
  const naechstes = LEVEL[stufe + 1] ?? null;
  return {
    stufe,
    titel: aktuell.titel,
    xp: sicher,
    naechstesXp: naechstes ? naechstes.xp : null,
  };
}

export function levelAufstieg(altXp: number, neuXp: number): boolean {
  return levelVonXp(neuXp).stufe > levelVonXp(altXp).stufe;
}
