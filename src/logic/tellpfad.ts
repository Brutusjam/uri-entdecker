export interface TellStation {
  id: string;
  name: string;
  text: string;
}

/** Laut Sage: Bürglen → Altdorf → Tellsplatte → Rütli. */
export const TELL_STATIONEN: TellStation[] = [
  { id: 'sage-tellmuseum', name: 'Bürglen', text: 'Tells Heimat laut Sage, Tell-Museum.' },
  { id: 'sage-telldenkmal', name: 'Altdorf', text: 'Apfelschuss und Telldenkmal.' },
  { id: 'sage-tellskapelle', name: 'Tellsplatte', text: 'Tellsprung aus dem Boot, Tellskapelle bei Sisikon.' },
  { id: 'sage-ruetli', name: 'Rütli', text: 'Rütlischwur bei Seelisberg.' },
];

export function tellStationRichtig(station: TellStation, auswahlId: string | null): boolean {
  return auswahlId === station.id;
}

export function naechsteTellStation(index: number): TellStation | null {
  return TELL_STATIONEN[index] ?? null;
}

export function tellPfadFertig(index: number): boolean {
  return index >= TELL_STATIONEN.length;
}
