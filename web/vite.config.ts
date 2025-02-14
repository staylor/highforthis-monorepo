import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

let publicPath = '/';
if (process.env.NODE_ENV === 'production') {
  publicPath = 'https://static.highforthis.com/build/';
}

export default defineConfig({
  base: publicPath,
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
});
