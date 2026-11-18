import { defineCollection } from 'astro:content';
import { glob, type Loader } from 'astro/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { idFromEntryPath, titleFromId } from './lib/paths';
import { z } from 'astro/zod';

/**
 * Filesystem-driven docs loader.
 *
 * Wraps Astro's `glob` loader to add two behaviours, both derived from the
 * filesystem so no manual registration is ever needed:
 *   1. Numeric ordering prefixes are removed from entry ids (and therefore URLs).
 *   2. A missing `title` is derived from the file or directory name.
 *
 * Files whose name starts with `_` are ignored (handy for private notes).
 */
function phypediaDocsLoader(): Loader {
  const inner = glob({
    base: './src/content/docs',
    pattern: '**/[^_]*.{md,mdx}',
    generateId: ({ entry }) => idFromEntryPath(entry),
  });

  return {
    name: 'phypedia-docs-loader',
    load: (context) =>
      inner.load({
        ...context,
        parseData: (props) =>
          context.parseData({
            ...props,
            data: { title: titleFromId(props.id), ...props.data },
          }),
      }),
  };
}

const resources = defineCollection({
  loader: glob({ base: './src/content/resources', pattern: '*.json' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    items: z.array(
      z.object({
        title: z.string(),
        url: z.string().url(),
        by: z.string().optional(), // author, channel, site owner…
        note: z.string().optional(),
      }),
    ),
  }),
});

export const collections = {
  docs: defineCollection({
    loader: phypediaDocsLoader(),
    schema: docsSchema(),
  }),
  resources,
};
