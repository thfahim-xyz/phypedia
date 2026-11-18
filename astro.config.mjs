// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { satteri } from '@astrojs/markdown-satteri';
import { satteriMathjax } from 'satteri-mathjax';
import { SITE } from './src/lib/config.ts';

// https://astro.build/config
export default defineConfig({
  site: SITE.url,
  // Satteri parses Markdown/MDX; `features.math` enables `$…$` and `$$…$$` syntax
  // and satteri-mathjax renders it to self-contained SVG at build time (no client JS).
  markdown: {
    processor: satteri({
      features: { math: true },
      mdastPlugins: [satteriMathjax()],
    }),
  },
  integrations: [
    starlight({
      title: SITE.title,
      description: SITE.description,
      favicon: '/favicon.svg',
      // src/pages/404.astro provides the custom 404 page.
      disable404Route: true,
      customCss: ['./src/styles/global.css', './src/styles/print.css'],
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 4 },
      // Navigation, pagination and the library are generated from the filesystem
      // (src/lib/site.ts); Starlight's own sidebar is replaced by the override below.
      components: {
        Header: './src/components/starlight/Header.astro',
        Sidebar: './src/components/starlight/Sidebar.astro',
        Footer: './src/components/starlight/Footer.astro',
        PageTitle: './src/components/starlight/PageTitle.astro',
        PageSidebar: './src/components/starlight/PageSidebar.astro',
        TwoColumnContent: './src/components/starlight/TwoColumnContent.astro',
        Pagination: './src/components/starlight/Pagination.astro',
        ThemeSelect: './src/components/starlight/ThemeSelect.astro',
        MobileMenuFooter: './src/components/starlight/MobileMenuFooter.astro',
      },
      head: [
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
        {
          tag: 'link',
          attrs: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Playfair+Display:wght@500;600;700&display=swap',
          },
        },
        // Restore the collapsed-sidebar preference before first paint (no layout flash).
        {
          tag: 'script',
          content:
            "try{if(localStorage.getItem('phypedia-sidebar')==='collapsed')document.documentElement.dataset.sidebar='collapsed'}catch(e){}",
        },
      ],
    }),
  ],
});
