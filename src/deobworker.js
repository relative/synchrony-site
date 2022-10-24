import Log from './log'
import { Deobfuscator } from 'deobfuscator'

const sync = new Deobfuscator()

Log.log = (level, ...args) => {
  postMessage({
    log: [level, ...args],
  })
}

addEventListener('message', async ({ data }) => {
  if (typeof data === 'string') {
    try {
      const deobfuscated = await sync.deobfuscateSource(data)
      postMessage({
        complete: deobfuscated,
      })
    } catch (err) {
      postMessage({
        error: err.toString(),
      })
    }
  }
})
