import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' makes the build use relative asset paths, so it works whether
// GrowMap is served at the root of your GitHub Pages site or under a
// project subpath (https://username.github.io/repo-name/) without any
// extra configuration.
export default defineConfig({
  plugins: [react()],
  base: './',
});
