import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { remarkKroki } from 'remark-kroki';

// https://astro.build/config
export default defineConfig({
	site: 'https://blog.kaet.xyz',
	integrations: [
		mdx({
			remarkPlugins: [
				[remarkKroki, {
					server: 'https://kroki.io',
					output: 'inline-svg', // Changed from 'svg' to 'inline-svg'
				}]
			],
		}), 
		sitemap()
	],
});