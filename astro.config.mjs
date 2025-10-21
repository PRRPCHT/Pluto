// @ts-check
import { defineConfig } from 'astro/config';
import { readFileSync } from 'fs';

import tailwindcss from '@tailwindcss/vite';

// Read base path from pluto-config.json
let basePath = '/';
try {
	const config = JSON.parse(readFileSync('./pluto-config.json', 'utf8'));
	basePath = config.base_path || '/';
} catch (error) {
	console.warn('Could not read base_path from pluto-config.json, using default "/"');
}

// https://astro.build/config
export default defineConfig({
	base: basePath,
	vite: {
		plugins: [tailwindcss()]
	}
});
