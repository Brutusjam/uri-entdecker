import { describe, expect, it } from 'vitest';
import { naechsteTellStation, TELL_STATIONEN, tellPfadFertig, tellStationRichtig } from './tellpfad';

describe('tellpfad', () => {
  it('hat vier Stationen in der Sage-Reihenfolge', () => {
    expect(TELL_STATIONEN.map((s) => s.name)).toEqual(['Bürglen', 'Altdorf', 'Tellsplatte', 'Rütli']);
    expect(tellStationRichtig(TELL_STATIONEN[0]!, 'sage-tellmuseum')).toBe(true);
    expect(naechsteTellStation(0)?.id).toBe('sage-tellmuseum');
    expect(tellPfadFertig(4)).toBe(true);
  });
});
