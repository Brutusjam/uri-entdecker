import { GEMEINDEN } from './gemeinden';
import { KANTONE } from './kantone';
import { GEWAESSER } from './gewaesser';
import { TAELER } from './taeler';
import { PAESSE } from './paesse';
import { BERGE } from './berge';
import { SAGENORTE, HOHLE_GASSE } from './sagenorte';
import type { LernElement } from '../types/karte';

export const GRUND_ELEMENTE: LernElement[] = [...GEMEINDEN, ...KANTONE, ...TAELER, ...GEWAESSER];

export const PROFI_ELEMENTE: LernElement[] = [...PAESSE, ...BERGE, ...SAGENORTE];

export const ALLE_ELEMENTE: LernElement[] = [...GRUND_ELEMENTE, ...PROFI_ELEMENTE];

export const ELEMENT_MAP = new Map([...ALLE_ELEMENTE, HOHLE_GASSE].map((e) => [e.id, e]));
