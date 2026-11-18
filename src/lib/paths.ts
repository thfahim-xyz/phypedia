/**
 * Pure path/title helpers shared by the content config and the navigation
 * utilities. No `astro:content` imports, so it is safe inside `content.config.ts`.
 *
 * Naming rules (filesystem is the single source of truth):
 *   - `01-name`  -> ordered by 1, URL segment `name`
 *   - `02.md`    -> ordered by 2, URL segment `02` (a bare number is kept as-is)
 *   - `index.md` -> overview page of its directory (optional)
 */
import { DOMAINS, SITE } from './config';

/** Removes a leading `NN-` ordering prefix, but never turns `01` into an empty string. */
const ORDER_PREFIX = /^\d+-(?=.)/;

/** URL slug of a single filesystem segment. */
export const slugOf = (segment: string): string =>
  segment.replace(ORDER_PREFIX, '').toLowerCase().replace(/\s+/g, '-');

/** Numeric ordering of a segment (`03-foo` and `03` -> 3); unnumbered sorts last. */
export function orderOf(segment: string): number {
  const match = /^(\d+)(?:-|$)/.exec(segment);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

/**
 * Collection entry id from a path relative to `src/content/docs`.
 * `01-cp/02-books/03-chapter/04.mdx` -> `cp/books/chapter/04`.
 * A trailing `index` is kept; Starlight turns `x/index` into the route `x/`.
 */
export function idFromEntryPath(entryPath: string): string {
  return entryPath
    .replace(/\.(md|mdx)$/i, '')
    .split('/')
    .map(slugOf)
    .join('/');
}

/** Human title for a URL segment, used whenever frontmatter has no `title`. */
export function titleFromSegment(slug: string, depth: number): string {
  if (depth === 1 && DOMAINS[slug]) return DOMAINS[slug].title;
  if (/^\d+$/.test(slug)) return `Section ${Number(slug)}`;
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

/** Title derived from a collection entry id (an `index` takes its directory's name). */
export function titleFromId(id: string): string {
  const segments = id.split('/');
  if (segments.at(-1) === 'index') segments.pop();
  const slug = segments.at(-1);
  return slug ? titleFromSegment(slug, segments.length) : SITE.title;
}

/** Builds a trailing-slash URL that respects Astro's `base` option. */
export function withBase(...segments: string[]): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const rest = segments.filter(Boolean).join('/');
  return rest ? `${base}/${rest}/` : `${base}/`;
}

/** Splits a request pathname into content segments (base and slashes removed). */
export function pathSegments(pathname: string): string[] {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const path = base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  return path.split('/').filter(Boolean);
}
