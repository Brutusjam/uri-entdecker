import confetti from 'canvas-confetti';

export function feiereKonfetti(reduziert: boolean): void {
  if (reduziert || typeof window === 'undefined') return;
  void confetti({
    particleCount: 90,
    spread: 70,
    origin: { y: 0.35 },
    colors: ['#FFC928', '#3DBE6B', '#3AA7E8', '#F5B301'],
    disableForReducedMotion: true,
  });
}
