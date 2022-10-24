import * as monaco from 'monaco-editor'
import { Deobfuscator } from 'deobfuscator'
import Config from './config'
import editor from './editor'
import Log from './log'
import './index.scss'

function changeTheme(e) {
  const theme = e.matches ? 'dark' : 'light'
  Config.theme = theme
  document.body.className = `${theme}`
  if (editor) {
    monaco.editor.setTheme(theme)
  }
}
function humanize(milliseconds) {
  let seconds = ~~(milliseconds / 1000),
    minutes = ~~(seconds / 60)

  return `${minutes}m ${seconds}s ${milliseconds}ms`
}
const darkMq = window.matchMedia('(prefers-color-scheme: dark)')
darkMq.addEventListener('change', e => changeTheme(e))
changeTheme(darkMq)

const sync = new Deobfuscator()

const btnDeobfuscate = document.getElementById('btn-deobfuscate')

async function deobfuscate(source) {
  let deobfuscated = source
  try {
    let start = performance.now()
    deobfuscated = await sync.deobfuscateSource(source)
    let fin = performance.now()
    Log.log(
      'success',
      'Deobfuscation complete in',
      humanize(Math.ceil(fin - start))
    )
  } catch (err) {
    console.error('Deobfuscation error!', err)
  } finally {
    return deobfuscated
  }
}

btnDeobfuscate.addEventListener('click', async e => {
  e.preventDefault()

  btnDeobfuscate.setAttribute('disabled', '')
  let newSource = await deobfuscate(editor.getValue())
  btnDeobfuscate.removeAttribute('disabled')

  editor.setValue(newSource)
  editor.setScrollPosition({ scrollTop: 0 })
})
