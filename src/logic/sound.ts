export type KlangArt = 'richtig' | 'falsch' | 'level' | 'sticker';

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  return ctx;
}

function ton(ac: AudioContext, freq: number, start: number, dauer: number, typ: OscillatorType = 'triangle') {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = typ;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.12, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dauer);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(start);
  osc.stop(start + dauer + 0.02);
}

export function spieleKlang(art: KlangArt, an: boolean): void {
  if (!an) return;
  const ac = audio();
  if (!ac) return;
  void ac.resume();
  const t = ac.currentTime;
  if (art === 'richtig') {
    ton(ac, 523.25, t, 0.12);
    ton(ac, 659.25, t + 0.08, 0.14);
    ton(ac, 783.99, t + 0.16, 0.18);
    return;
  }
  if (art === 'falsch') {
    ton(ac, 196, t, 0.16, 'sine');
    ton(ac, 174.61, t + 0.12, 0.2, 'sine');
    return;
  }
  if (art === 'sticker') {
    ton(ac, 880, t, 0.1);
    ton(ac, 1174.66, t + 0.07, 0.12);
    return;
  }
  ton(ac, 392, t, 0.12);
  ton(ac, 523.25, t + 0.1, 0.12);
  ton(ac, 659.25, t + 0.2, 0.12);
  ton(ac, 783.99, t + 0.3, 0.22);
}
