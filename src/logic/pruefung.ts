/** Schweizer Notenformel: 1 + 5 × Anteil richtig, auf halbe Note gerundet. */
export function schweizerNote(richtig: number, total: number): number {
  if (total <= 0) return 1;
  const anteil = Math.min(1, Math.max(0, richtig / total));
  const roh = 1 + 5 * anteil;
  return Math.min(6, Math.max(1, Math.round(roh * 2) / 2));
}

export function formatiereNote(note: number): string {
  return note.toFixed(1).replace('.', ',');
}

export function pruefungBestKey(kategorie: string): string {
  return `pruefung-${kategorie}`;
}

export function noteSpruch(note: number): string {
  if (note >= 5.5) return 'Wahnsinn – fast die beste Note!';
  if (note >= 5) return 'Toll! Das sitzt schon sehr gut.';
  if (note >= 4) return 'Gut geschafft. Die Fehlerliste hilft dir weiter.';
  return 'Noch nicht ganz. Übe die Fehler in Ruhe – dann klappt es.';
}
