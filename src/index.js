import * as monaco from 'monaco-editor'
import { Deobfuscator } from 'deobfuscator'
import Config from './config'
import editor from './editor'
import Log from './log'
import './style/index.scss'
import dayjs from './dayjs'
import { saveAs } from 'file-saver'

function changeTheme(e) {
  const theme = e.matches ? 'dark' : 'light'
  Config.theme = theme
  document.body.className = `${theme}`
  if (editor) {
    monaco.editor.setTheme(theme)
  }
}

const DURATION_FORMAT = 'm[m] s[s] SSS[ms]'

const darkMq = window.matchMedia('(prefers-color-scheme: dark)')
darkMq.addEventListener('change', e => changeTheme(e))
changeTheme(darkMq)

const sync = new Deobfuscator()

const btnDeobfuscate = document.getElementById('btn-deobfuscate'),
  btnSave = document.getElementById('btn-save')

function deobfuscateWithWorker(source, timeout = 120000) {
  return new Promise((resolve, reject) => {
    Log.log(
      'info',
      'Starting deobfuscation with timeout of',
      dayjs.duration(timeout).humanize()
    )
    let worker = new Worker('/deobworker.js')
    let timeoutId = setTimeout(() => {
      worker.terminate()
      reject(new Error('Timeout exceeded'))
    }, timeout)
    worker.addEventListener('message', ({ data }) => {
      if (data.log) {
        const [level, ...args] = data.log
        Log.log(level, ...args)
      } else if (typeof data.complete !== 'undefined') {
        clearTimeout(timeoutId)
        worker.terminate()
        resolve(data.complete)
      } else if (typeof data.error !== 'undefined') {
        clearTimeout(timeoutId)
        worker.terminate()
        reject(data.error)
      }
    })
    worker.postMessage(source)
  })
}

/**
 * @param {string} source
 * @param {any} timeout Unused
 */
function deobfuscateMainThread(source, timeout = 0) {
  return sync.deobfuscateSource(source, {})
}

async function deobfuscate(source) {
  let deobfuscated = '// Deobfuscation failed\n' + source
  try {
    let start = performance.now()

    if (Worker) {
      deobfuscated = await deobfuscateWithWorker(source)
    } else {
      deobfuscated = await deobfuscateMainThread(source)
    }

    let finish = performance.now()
    let duration = dayjs
      .duration(Math.ceil(finish - start))
      .format(DURATION_FORMAT)
    Log.log('success', 'Deobfuscation complete in', duration)
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
btnSave.addEventListener('click', async e => {
  e.preventDefault()
  try {
    let blob = new Blob([editor.getValue()], {
      type: 'application/javascript;charset=utf-8',
    })
    saveAs(blob, `deobfuscated-${dayjs().toISOString()}.js`)
  } catch (err) {
    console.error('Failed to save editor', err.message)
  }
})
