/**
 * Central, dependency-free site configuration.
 *
 * Kept free of `astro:content` imports on purpose so it can be used from
 * `astro.config.mjs`, `content.config.ts`, components, and pages alike.
 * Everything a site owner is likely to edit lives here.
 */

export const SITE = {
  title: 'Phypedia',
  description:
    'A personal collection of notes for exploring physics through concepts, intuition, and mathematics.',
  /** Production URL (used for the sitemap and canonical links). */
  url: 'https://phypedia.vercel.app',
  /** Copyright holder shown in the footer and printed pages. */
  author: 'T. H. Fahim',
  /** Footer and About page links. Icon names come from Starlight's built-in set. */
  socials: [
    { label: 'Email', href: 'mailto:thfahim.xyz@gmail.com', icon: 'email' },
    { label: 'GitHub', href: 'https://github.com/thfahim-xyz', icon: 'github' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/thfahim', icon: 'linkedin' },
    { label: 'Facebook', href: 'https://facebook.com/thfahim.xyz', icon: 'facebook' },
    { label: 'Instagram', href: 'https://instagram.com/thfahim.xyz', icon: 'instagram' },
  ],
} as const;

export interface DomainMeta {
  title: string;
  description: string;
  /**
   * A standalone domain is itself a book: its chapters live directly inside it
   * (Domain > Chapter > Section) instead of inside nested books.
   */
  standalone?: boolean;
}

/**
 * Optional display metadata for domains, keyed by the directory name with its
 * numeric prefix removed (`01-cp/` -> `cp`). A domain that is missing here still
 * works: its title is derived from the directory name and it is treated as a
 * regular domain that contains books.
 */
export const DOMAINS: Record<string, DomainMeta> = {
  'fundamentals': {
    title: 'Fundamentals',
    description: 'Core principles of physics and the mathematical tools used to describe them.',
    standalone: false,
  },
  cp: {
    title: 'Classical Physics',
    description: 'The classical theories of motion, matter, fields, and light.',
  },
  sp: {
    title: 'Statistical Physics',
    description: 'The macroscopic and microscopic foundations of thermal phenomena and statistical behavior.',
  },
  rp: {
    title: 'Relativistic Physics',
    description: 'The structure of space, time, gravity, and their relativistic descriptions.',
  },
  qp: {
    title: 'Quantum Physics',
    description: 'The fundamental principles and mathematical framework of quantum phenomena.',
  },
};
