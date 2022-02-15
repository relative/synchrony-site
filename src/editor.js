import * as monaco from 'monaco-editor'
import Config from './config'
import './themes'

self.MonacoEnvironment = {
  getWorkerUrl: function (_, label) {
    switch (label) {
      case 'javascript':
      case 'typescript':
        return '/ts.worker.js'
      default:
        return '/editor.worker.js'
    }
  },
}

const editor = monaco.editor.create(document.getElementById('editor'), {
  value: `// Paste your obfuscated code here`,
  language: 'javascript',
  theme: Config.theme,
  fontFamily:
    'ui-monospace, Menlo, Monaco, "Cascadia Code", "Cascadia Mono", "Segoe UI Mono", "Roboto Mono", "Oxygen Mono", "Ubuntu Monospace", "Source Code Pro","Fira Mono", "Droid Sans Mono", "Courier New", monospace',
  automaticLayout: true,

  tabSize: 4,
  insertSpaces: true,
})

export default editor
