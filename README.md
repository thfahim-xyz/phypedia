# Phypedia

*A personal collection of notes for exploring physics through concepts, intuition, and mathematics.*

Phypedia is a book-structured physics knowledge base designed for self-study and reference. It brings together explanations, mathematical tools, and connected ideas across major areas of physics, with an emphasis on clarity, structure, and understanding.

The site is built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build). Content is written in Markdown and MDX, with mathematical notation rendered by [MathJax](https://github.com/mathjax/MathJax).

## Contents

Phypedia is organized into five domains, each containing one or more books.

| Domain | Books |
|---|---|
| **Fundamentals** | Foundations of Physics · Mathematical Methods |
| **Classical Physics** | Classical Mechanics · Continuum Mechanics · Classical Electrodynamics · Classical Optics |
| **Statistical Physics** | Classical Thermodynamics · Classical Statistical Mechanics |
| **Relativistic Physics** | Special Relativity · General Relativity |
| **Quantum Physics** | Quantum Mechanics |

The content follows a simple hierarchy:

`Domain → Book → Chapter → Section`

## Development

### Requirements

- [Node.js](https://nodejs.org/) 22.12 or newer
- npm

### Getting started

```bash
git clone <repository-url>
cd phypedia
npm install
npm run dev
```

The development server starts locally and updates as you edit the source files.

### Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local development server |
| `npm run build` | Build the production site into `dist/` |
| `npm run preview` | Preview the production build locally |

## Writing content

**The filesystem is the source of structure.** Add or edit files and directories under `src/content/docs/`; the content tree and navigation are generated from that structure.

A typical content path looks like this:

```text
src/content/docs/
└── cp/
    └── 01-classical-mechanics/
        └── 01-particle-mechanics/
            ├── index.mdx
            └── 01/
                └── index.mdx
```

Numeric directory prefixes determine ordering and are removed from generated URLs. For example:

| Level | Example URL |
|---|---|
| Domain | `/cp/` |
| Book | `/cp/classical-mechanics/` |
| Chapter | `/cp/classical-mechanics/particle-mechanics/` |
| Section | `/cp/classical-mechanics/particle-mechanics/01/` |

### Content conventions

- **Titles:** Set a page's `title` in frontmatter. If omitted, it is derived from the filename or directory name.
- **Descriptions:** The optional `description` field is used for book overviews in the Library.
- **Overview pages:** `index.md` and `index.mdx` files are optional. If a node has no overview page, navigation links to its first available section.
- **Drafts:** Set `draft: true` to hide a page from production builds and navigation. Drafts remain visible during development.
- **Ignored files:** Files and directories whose names begin with `_` are ignored.
- **Domains:** Domain titles and descriptions are configured in the `DOMAINS` table in `src/lib/config.ts`. Unknown domains fall back to a title derived from the directory name. A domain marked `standalone: true` is treated as a book.

A minimal page can use the following frontmatter:

```yaml
---
title: "Page Title"
description: "A brief description."
draft: false
---
```

Only `title` is required in normal use; it can be derived automatically when omitted. `description` and `draft` are optional.

### Authoring features

| Feature | Syntax or component |
|---|---|
| Mathematics | `$...$` for inline math and `$$...$$` for display math |
| Footnotes | Standard Markdown footnotes, such as `[^1]` |
| Tables | Standard Markdown tables |
| Code | Fenced code blocks with syntax highlighting |
| Callouts | `<Callout type="note" title="...">...</Callout>` |
| Toggles | `<Toggle title="...">...</Toggle>` |
| Columns | `<Columns count={2}>...</Columns>` |
| Figures | `<Figure src={img} alt="..." caption="..." align="..." />` |
| Diagrams | `<Mermaid code={``} />` |

Callout types include `note`, `tip`, `important`, `warning`, `definition`, `theorem`, `example`, and `remark`.

In MDX files, import components using their relative or configured component paths. For example:

```mdx
import Callout from '@components/Callout.astro';
```

Use the corresponding component's actual filename and export when importing other components.

## Project structure

| Path | Responsibility |
|---|---|
| `src/content/docs/` | Markdown and MDX knowledge base |
| `src/content.config.ts` | Content collection and document loading |
| `src/lib/config.ts` | Site metadata, social links, and domain definitions |
| `src/lib/paths.ts` | Path, slug, and title utilities |
| `src/lib/site.ts` | Content tree, Library data, navigation, breadcrumbs, and pagination |
| `src/components/starlight/` | Customized Starlight components and overrides |
| `src/components/` | Custom content and interface components |
| `src/layouts/BaseLayout.astro` | Shared layout for standalone site pages |
| `src/styles/global.css` | Design tokens, theme mapping, and global typography |
| `src/styles/print.css` | Print-specific styles |
| `public/` | Static assets and public files |

## Customization

- **Colors and typography:** Edit the `--ph-*` design tokens in `src/styles/global.css`.
- **Site metadata and domains:** Edit `src/lib/config.ts`.
- **Fonts:** Configure font loading in `astro.config.mjs`.
- **Favicon:** Replace `public/favicon.svg`.

## Notes

- Search is powered by Pagefind and becomes available after `npm run build`; it is not populated by the development server.
- The default Starlight 404 route is disabled in favor of the custom page at `src/pages/404.astro`.

## Project status

Phypedia is under active development. Content and features may be incomplete or change as the knowledge base evolves.

## Contributing

Suggestions, corrections, and improvements are welcome. If you spot an error or would like to improve an explanation, open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](./LICENSE).
