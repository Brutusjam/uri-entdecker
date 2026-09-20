import type { FigurName, FigurPose } from '../../data/figuren';
import { cn } from './cn';
import { Figur } from './Figur';
import { SpeechBubble, type ZipfelSeite } from './SpeechBubble';

export interface BegleitungProps {
  name: FigurName;
  pose?: FigurPose;
  text: string;
  zipfel?: ZipfelSeite;
  className?: string;
}

export function Begleitung({
  name,
  pose = 'neutral',
  text,
  zipfel = 'rechts',
  className,
}: BegleitungProps) {
  return (
    <div className={cn('flex items-start justify-end gap-2', className)}>
      <SpeechBubble key={text} zipfel={zipfel} className="mt-3">
        {text}
      </SpeechBubble>
      <Figur name={name} pose={pose} className="shrink-0" />
    </div>
  );
}
