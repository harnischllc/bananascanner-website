// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://bananascanner.com',
  trailingSlash: 'never',
  output: 'static',
  build: {
    format: 'file',
  },
  integrations: [mdx(), sitemap()],
  vite: {
    css: {
      transformer: 'postcss',
    },
  },
});
