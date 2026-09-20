/** Öffentlicher Pfad ab public/ (mit führendem Slash). */
export function assetUrl(pfad: string): string {
  const sauber = pfad.startsWith('/') ? pfad.slice(1) : pfad;
  return `${import.meta.env.BASE_URL}${sauber}`;
}

/** Macht aus einer geladenen URL wieder einen öffentlichen Pfad (/geo/…). */
export function oeffentlicherPfad(url: string): string {
  const base = import.meta.env.BASE_URL;
  if (base !== '/' && url.startsWith(base)) {
    return `/${url.slice(base.length)}`;
  }
  return url.startsWith('/') ? url : `/${url}`;
}
