import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import htmlPlugin from '@chialab/esbuild-plugin-html'
import { sassPlugin } from 'esbuild-sass-plugin'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import esbuild from 'esbuild'

const __filename = fileURLToPath(import.meta.url),
  __dirname = dirname(__filename)

const ROOT_PATH = join(__dirname, '..'),
  DIST_PATH = join(ROOT_PATH, 'dist'),
  SRC_PATH = join(ROOT_PATH, 'src'),
  MONACO_PATH = join(ROOT_PATH, 'node_modules', 'monaco-editor', 'esm', 'vs')

const args = process.argv.slice(2)

// --watch or -w
const watch = args.length > 0 && args[0].match(/^(?:--watch|-w)$/gi) !== null
if (watch) console.log('watch mode')

const buildOptions = {
  entryPoints: [
    join(SRC_PATH, 'index.html'),
    join(SRC_PATH, 'deobworker.js'),
    join(MONACO_PATH, 'editor', 'editor.worker.js'),
    join(MONACO_PATH, 'language', 'typescript', 'ts.worker.js'),
  ],
  outdir: DIST_PATH,
  outbase: SRC_PATH,

  assetNames: '[name]',
  entryNames: '[name]',

  bundle: true,
  sourcemap: false,
  minify: true,

  plugins: [NodeModulesPolyfillPlugin(), sassPlugin(), htmlPlugin()],

  loader: {
    '.ttf': 'file',
    '.png': 'file',
  },

  logLevel: 'info',
  logLimit: process.env.CI ? 0 : 30,
}

let p = watch
  ? esbuild.serve(
      {
        servedir: DIST_PATH,
      },
      buildOptions
    )
  : esbuild.build(buildOptions)

p.catch(_err => {
  process.exit(1)
})
