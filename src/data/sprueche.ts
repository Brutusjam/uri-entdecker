export type Anlass =
  | 'begruessung'
  | 'tipp'
  | 'richtig'
  | 'falsch'
  | 'serie'
  | 'levelUp'
  | 'sticker'
  | 'sage';

export type Sprecher = 'lia' | 'stierli';

export interface Spruch {
  anlass: Anlass;
  sprecher: Sprecher;
  text: string;
}

export const SPRUECHE: Spruch[] = [
  { anlass: 'begruessung', sprecher: 'lia', text: 'Bereit für ein Abenteuer in Uri?' },
  { anlass: 'begruessung', sprecher: 'lia', text: 'Schau, wie weit du schon bist! Tippe auf die Karte oder starte ein Spiel.' },
  { anlass: 'begruessung', sprecher: 'lia', text: 'Hallo! Wo sollen wir heute hin?' },
  { anlass: 'begruessung', sprecher: 'lia', text: 'Grüezi mitenand! Los gehts.' },
  { anlass: 'begruessung', sprecher: 'lia', text: 'Ich hab die Karte, du die Ideen. Bereit?' },

  { anlass: 'tipp', sprecher: 'lia', text: 'Schau nochmal genau hin.' },
  { anlass: 'tipp', sprecher: 'lia', text: 'Denk an die Nachbarn auf der Karte.' },
  { anlass: 'tipp', sprecher: 'lia', text: 'Näher am See – oder eher im Berg?' },
  { anlass: 'tipp', sprecher: 'stierli', text: 'Psst – letzter Tipp von mir!' },
  { anlass: 'tipp', sprecher: 'stierli', text: 'Schau, wo es blinkt. Das ist der Ort!' },
  { anlass: 'tipp', sprecher: 'stierli', text: 'Okay, ich darf fast nichts sagen … fast!' },

  { anlass: 'richtig', sprecher: 'lia', text: 'Ja! Das sitzt!' },
  { anlass: 'richtig', sprecher: 'lia', text: 'Super, du bist auf der Spur!' },
  { anlass: 'richtig', sprecher: 'lia', text: 'Genau da! Starke Sache.' },
  { anlass: 'richtig', sprecher: 'stierli', text: 'Muuuh-ja! Richtig!' },
  { anlass: 'richtig', sprecher: 'stierli', text: 'Ich wusste, dass du das kannst!' },

  { anlass: 'falsch', sprecher: 'stierli', text: 'Uuuh, daneben! Kein Stress.' },
  { anlass: 'falsch', sprecher: 'stierli', text: 'Hui, das war nix. Nochmal!' },
  { anlass: 'falsch', sprecher: 'stierli', text: 'Ich hab auch schon falsch geschnaubt.' },
  { anlass: 'falsch', sprecher: 'stierli', text: 'Macht nüt! Noch ein Versuch.' },
  { anlass: 'falsch', sprecher: 'stierli', text: 'Fast! Versuch es nochmal.' },

  { anlass: 'serie', sprecher: 'lia', text: 'Eine Serie! Du bleibst dran, cool.' },
  { anlass: 'serie', sprecher: 'stierli', text: 'Tag für Tag – Respekt!' },

  { anlass: 'levelUp', sprecher: 'lia', text: 'Level rauf! Du wirst zur Bergführerin.' },
  { anlass: 'levelUp', sprecher: 'stierli', text: 'Jetzt aber! Das war ein Sprung nach oben.' },

  { anlass: 'sticker', sprecher: 'lia', text: 'Ein Sticker! Klatsch – der gehört ins Album.' },
  { anlass: 'sticker', sprecher: 'stierli', text: 'Glänzt fast so schön wie mein Nasenring.' },

  { anlass: 'sage', sprecher: 'lia', text: 'Man erzählt sich diese Geschichte in Uri …' },
  { anlass: 'sage', sprecher: 'stierli', text: 'Beim Teufel werde ich ganz klein. Nur so als Hinweis.' },
];
