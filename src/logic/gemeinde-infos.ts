import type { LernElement } from '../types/karte';

export interface GemeindeMerkmal {
  id: string;
  label: string;
}

export function formatiereEinwohner(anzahl: number): string {
  return Math.round(anzahl)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, "'");
}

export function formatiereFlaeche(km2: number): string {
  return `${km2.toFixed(2).replace('.', ',')} km²`;
}

export function gemeindeMerkmale(
  aktuell: LernElement,
  alle: readonly LernElement[],
): GemeindeMerkmal[] {
  if (aktuell.einwohner == null || aktuell.flaecheKm2 == null) return [];

  const mitZahlen = alle.filter(
    (g) => g.kategorie === 'gemeinde' && g.einwohner != null && g.flaecheKm2 != null,
  );
  const maxEinwohner = Math.max(...mitZahlen.map((g) => g.einwohner!));
  const minEinwohner = Math.min(...mitZahlen.map((g) => g.einwohner!));
  const maxFlaeche = Math.max(...mitZahlen.map((g) => g.flaecheKm2!));
  const minFlaeche = Math.min(...mitZahlen.map((g) => g.flaecheKm2!));
  const nachEinwohnern = [...mitZahlen].sort((a, b) => (b.einwohner ?? 0) - (a.einwohner ?? 0));

  const merkmale: GemeindeMerkmal[] = [];
  if (aktuell.istHauptort) merkmale.push({ id: 'hauptort', label: 'Hauptort' });
  if (aktuell.einwohner === maxEinwohner) {
    merkmale.push({ id: 'meiste-einwohner', label: 'Meiste Einwohner' });
  } else if (nachEinwohnern[1]?.id === aktuell.id) {
    merkmale.push({ id: 'zweit-einwohner', label: '2. bei den Einwohnern' });
  }
  if (aktuell.flaecheKm2 === maxFlaeche) {
    merkmale.push({ id: 'groesste-flaeche', label: 'Grösste Fläche' });
  }
  if (aktuell.flaecheKm2 === minFlaeche) {
    merkmale.push({ id: 'kleinste-flaeche', label: 'Kleinste Fläche' });
  }
  if (aktuell.einwohner === minEinwohner) {
    merkmale.push({ id: 'wenigste-einwohner', label: 'Wenigste Einwohner' });
  }
  return merkmale;
}
