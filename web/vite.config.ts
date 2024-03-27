import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// let publicPath = '/';
// if (process.env.NODE_ENV === 'production') {
//   publicPath = 'https://static.highforthis.com/build/';
// }

export default defineConfig({
  plugins: [tsconfigPaths()],
});
