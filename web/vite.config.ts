import { vitePlugin as remix } from '@remix-run/dev';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import babel from 'vite-plugin-babel';

let publicPath = '/';
if (process.env.NODE_ENV === 'production') {
  publicPath = 'https://static.highforthis.com/build/';
}

export default defineConfig({
  base: publicPath,
  plugins: [
    remix({
      appDirectory: 'src',
      ignoredRouteFiles: ['**/.*'],
    }),
    babel({
      filter: /\.[jt]sx?$/,
      babelConfig: {
        presets: ['@babel/preset-typescript'],
        plugins: [
          [
            'babel-plugin-react-compiler',
            {
              compilationMode: 'infer',
              panicThreshold: 'NONE',
            },
          ],
        ],
      },
    }),
    tsconfigPaths(),
  ],
});
