/**
 * Filesystem-driven content model.
 *
 * Everything the site needs to know about its structure (library, global and
 * book navigation, breadcrumbs, previous/next) is derived here from the docs
 * collection. Nothing is registered by hand: add, rename or remove a file or
 * directory under `src/content/docs/` and rebuild.
 *
 * Hierarchy:  Domain > Book > Chapter > Section
 * A "standalone" domain (see DOMAINS in config.ts) is itself the book.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { DOMAINS } from './config';
import { orderOf, pathSegments, slugOf, titleFromSegment, withBase } from './paths';

export type DocEntry = CollectionEntry<'docs'>;

export interface NavNode {
  /** URL segment (numeric prefix removed). */
  slug: string;
  /** URL segments from the root, e.g. ['cp', 'classical-mechanics']. */
  path: string[];
  /** `path` joined with `/`. */
  key: string;
  /** 1 = domain, 2 = book (or chapter in a standalone domain), … */
  depth: number;
  title: string;
  /** Canonical URL of this node's own page (only meaningful when `entry` exists). */
  href: string;
  /** Original filesystem segment, used for ordering. */
  raw: string;
  order: number;
  /** The page behind this node: an overview (`index.md`) or a section file. */
  entry?: DocEntry;
  children: NavNode[];
}

/** Flat, renderer-friendly navigation item. */
export interface NavItem {
  key: string;
  title: string;
  href?: string;
  children?: NavItem[];
}

const DOCS_ROOT = 'src/content/docs/';

export const isStandalone = (domainSlug: string): boolean => DOMAINS[domainSlug]?.standalone === true;

/** Original path segments of an entry (with ordering prefixes) minus the extension. */
function rawSegments(entry: DocEntry): string[] {
  const file = (entry.filePath ?? '').replace(/\\/g, '/');
  const relative = file.includes(DOCS_ROOT) ? file.split(DOCS_ROOT).pop()! : entry.id;
  return relative.replace(/\.(md|mdx)$/i, '').split('/');
}

function compareNodes(a: NavNode, b: NavNode): number {
  if (a.order !== b.order) return a.order < b.order ? -1 : 1;
  return a.raw.localeCompare(b.raw, undefined, { numeric: true });
}

function sortTree(node: NavNode): void {
  node.children.sort(compareNodes);
  node.children.forEach(sortTree);
}

async function buildTree(): Promise<NavNode> {
  // Drafts are visible while developing and removed from production builds,
  // mirroring Starlight's own route generation so links never point nowhere.
  const entries = await getCollection('docs', ({ data }) => import.meta.env.DEV || !data.draft);

  const root: NavNode = {
    slug: '',
    path: [],
    key: '',
    depth: 0,
    title: '',
    href: withBase(),
    raw: '',
    order: 0,
    children: [],
  };
  const lookup = new Map<string, NavNode>();

  for (const entry of entries) {
    const segments = rawSegments(entry);
    if (segments.at(-1) === 'index') segments.pop();
    if (segments.length === 0) continue; // a root index is not part of the library

    let parent = root;
    segments.forEach((raw, index) => {
      const path = [...parent.path, slugOf(raw)];
      const key = path.join('/');
      let node = lookup.get(key);
      if (!node) {
        node = {
          slug: path[path.length - 1],
          path,
          key,
          depth: index + 1,
          title: titleFromSegment(path[path.length - 1], index + 1),
          href: withBase(...path),
          raw,
          order: orderOf(raw),
          children: [],
        };
        lookup.set(key, node);
        parent.children.push(node);
      } else if (orderOf(raw) < node.order) {
        // Duplicate prefixes (`01-a`, `02-a`) merge into one node; keep the earliest.
        node.order = orderOf(raw);
        node.raw = raw;
      }
      parent = node;
    });

    parent.entry = entry;
    parent.title = entry.data.title;
  }

  sortTree(root);
  return root;
}

let cachedTree: Promise<NavNode> | undefined;

/** The whole content tree. Cached per build; rebuilt on every request in dev. */
export function getTree(): Promise<NavNode> {
  if (import.meta.env.DEV) return buildTree();
  return (cachedTree ??= buildTree());
}

/** Pages in reading order: a node's own page first, then its descendants. */
export function flattenPages(node: NavNode): NavNode[] {
  return [...(node.entry ? [node] : []), ...node.children.flatMap(flattenPages)];
}

/** Where a node should send the reader: its overview, else its first page. */
export function startHref(node: NavNode): string | undefined {
  return flattenPages(node)[0]?.href;
}

function countSections(node: NavNode): number {
  return flattenPages(node).filter((page) => page.children.length === 0).length;
}

/* -------------------------------------------------------------------------- */
/* Navigation items                                                           */
/* -------------------------------------------------------------------------- */

function toNavItem(node: NavNode): NavItem {
  const children = node.children.map(toNavItem);
  if (children.length === 0) {
    return { key: node.key, title: node.title, href: node.entry ? node.href : undefined };
  }
  const overview: NavItem[] = node.entry
    ? [{ key: `${node.key}#overview`, title: 'Overview', href: node.href }]
    : [];
  return { key: node.key, title: node.title, children: [...overview, ...children] };
}

/** Global mode: Library, every domain (expanding to its books only), About. */
export async function getGlobalNav(): Promise<NavItem[]> {
  const root = await getTree();

  const domains: NavItem[] = root.children.map((domain) => {
    if (isStandalone(domain.slug) || domain.children.length === 0) {
      return { key: domain.key, title: domain.title, href: startHref(domain) };
    }
    const overview: NavItem[] = domain.entry
      ? [{ key: `${domain.key}#overview`, title: 'Overview', href: domain.href }]
      : [];
    const books = domain.children.map((book) => ({
      key: book.key,
      title: book.title,
      href: startHref(book),
    }));
    return { key: domain.key, title: domain.title, children: [...overview, ...books] };
  });

  return [
    { key: 'library', title: 'Library', href: withBase('library') },
    ...domains,
    { key: 'about', title: 'About', href: withBase('about') },
  ];
}

export interface ReadingContext {
  domain: NavNode;
  book: NavNode;
  /** Nodes from the domain down to the current page. */
  trail: NavNode[];
  /** Every page of the book in reading order (drives previous/next). */
  pages: NavNode[];
  /** Hierarchical items for the reading-mode sidebar (the book's children). */
  items: NavItem[];
}

function resolveTrail(root: NavNode, segments: string[]): NavNode[] {
  const trail: NavNode[] = [];
  let node: NavNode | undefined = root;
  for (const segment of segments) {
    node = node.children.find((child) => child.slug === segment);
    if (!node) break;
    trail.push(node);
  }
  return trail;
}

/** The tree node for a URL, or undefined if the path isn't part of the library. */
export async function getNode(pathname: string): Promise<NavNode | undefined> {
  const segments = pathSegments(pathname);
  const node = resolveTrail(await getTree(), segments).at(-1);
  return node?.key === segments.join('/') ? node : undefined;
}

/**
 * Reading mode applies on any page inside a book (including the book overview).
 * Returns undefined elsewhere: domain pages, Library, About, Home, 404.
 */
export async function getReadingContext(pathname: string): Promise<ReadingContext | undefined> {
  const root = await getTree();
  const trail = resolveTrail(root, pathSegments(pathname));
  const domain = trail[0];
  if (!domain) return undefined;

  const book = isStandalone(domain.slug) ? domain : trail[1];
  if (!book) return undefined;

  return {
    domain,
    book,
    trail,
    pages: flattenPages(book),
    items: book.children.map(toNavItem),
  };
}

/** Breadcrumb trail (domain -> … -> current page) for any content URL. */
export async function getTrail(pathname: string): Promise<NavNode[]> {
  return resolveTrail(await getTree(), pathSegments(pathname));
}

export interface AdjacentPage {
  title: string;
  href: string;
}

/** Previous and next page within the current book. */
export async function getAdjacentPages(
  pathname: string,
): Promise<{ prev?: AdjacentPage; next?: AdjacentPage }> {
  const context = await getReadingContext(pathname);
  if (!context) return {};

  const key = pathSegments(pathname).join('/');
  const index = context.pages.findIndex((page) => page.key === key);
  if (index === -1) return {};

  const pick = (page?: NavNode): AdjacentPage | undefined =>
    page ? { title: page.title, href: page.href } : undefined;
  return { prev: pick(context.pages[index - 1]), next: pick(context.pages[index + 1]) };
}

/* -------------------------------------------------------------------------- */
/* Library                                                                    */
/* -------------------------------------------------------------------------- */

export interface BookCard {
  key: string;
  title: string;
  description?: string;
  href?: string;
  sections: number;
}

export interface DomainGroup {
  key: string;
  title: string;
  description: string;
  books: BookCard[];
}

/** Library listing: every domain with its books, generated from the filesystem. */
export async function getLibrary(): Promise<DomainGroup[]> {
  const root = await getTree();

  const toCard = (node: NavNode): BookCard => ({
    key: node.key,
    title: node.title,
    description: node.entry?.data.description,
    href: startHref(node),
    sections: countSections(node),
  });

  return root.children.map((domain) => ({
    key: domain.key,
    title: domain.title,
    description: domain.entry?.data.description ?? DOMAINS[domain.slug]?.description ?? '',
    books: isStandalone(domain.slug) ? [toCard(domain)] : domain.children.map(toCard),
  }));
}
