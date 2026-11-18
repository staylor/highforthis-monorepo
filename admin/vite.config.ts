import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  // The public site forwards /admin to this app, so its scripts, styles and public
  // files live under /admin/ too, apart from the public site's own.
  base: '/admin/',
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: {
    watch: {
      ignored: ['**/__tests__/**', '**/*.test.{js,jsx,ts,tsx}'],
    },
  },
});
