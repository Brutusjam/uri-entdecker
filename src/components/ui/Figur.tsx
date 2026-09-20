import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { figurDatei, type FigurName, type FigurPose } from '../../data/figuren';
import { cn } from './cn';

export interface FigurProps {
  name: FigurName;
  pose?: FigurPose;
  className?: string;
}

const NAMEN: Record<FigurName, string> = {
  lia: 'Lia',
  stierli: 'Stierli',
};

export function Figur({ name, pose = 'neutral', className }: FigurProps) {
  const reduziert = useReducedMotion() ?? false;
  const src = figurDatei(name, pose);

  return (
    <motion.span
      className={cn('relative inline-block h-36 w-36 origin-bottom md:h-44 md:w-44', className)}
      animate={reduziert ? undefined : { scale: [1, 1.02, 1] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <AnimatePresence>
        <motion.img
          key={src}
          src={src}
          alt={NAMEN[name]}
          width={400}
          height={400}
          className="absolute inset-0 h-full w-full object-contain object-bottom"
          initial={{ opacity: reduziert ? 1 : 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: reduziert ? 1 : 0 }}
          transition={{ duration: reduziert ? 0 : 0.15 }}
        />
      </AnimatePresence>
    </motion.span>
  );
}
