import { useMemo } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import type { Feature, Geometry } from 'geojson';
import { mitD3Windung } from '../logic/karte';
import { cn } from './ui/cn';

interface UmrissBildProps {
  feature: Feature<Geometry>;
  className?: string;
  titel?: string;
}

export function UmrissBild({ feature, className, titel }: UmrissBildProps) {
  const d = useMemo(() => {
    const gezeichnet = mitD3Windung(feature);
    const projektion = geoMercator().fitExtent(
      [
        [6, 6],
        [74, 74],
      ],
      gezeichnet,
    );
    return geoPath(projektion)(gezeichnet) ?? '';
  }, [feature]);

  return (
    <svg viewBox="0 0 80 80" className={cn('h-full w-full', className)} role={titel ? 'img' : undefined} aria-hidden={titel ? undefined : true}>
      {titel ? <title>{titel}</title> : null}
      <path d={d} className="fill-wiese stroke-ink" strokeWidth={2} />
    </svg>
  );
}
