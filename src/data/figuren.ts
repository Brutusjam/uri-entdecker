export const LIA_POSEN = [
  'neutral',
  'zeigt',
  'denkt',
  'jubelt',
  'troestet',
  'freut-sich',
  'staunt',
  'wanderin',
] as const;

export const STIERLI_POSEN = [
  'neutral',
  'zeigt',
  'denkt',
  'jubelt',
  'troestet',
  'freut-sich',
  'erschrocken',
  'luftsprung',
  'wanderin',
] as const;

export type LiaPose = (typeof LIA_POSEN)[number];
export type StierliPose = (typeof STIERLI_POSEN)[number];
export type FigurName = 'lia' | 'stierli';
export type FigurPose = LiaPose | StierliPose;

export function figurDatei(name: FigurName, pose: FigurPose): string {
  return `/figuren/${name}-${pose}.svg`;
}
