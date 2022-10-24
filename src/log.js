const Log = {
  // esbuild-plugin-html breaks import paths when you import a file
  Icons: {
    debug: '/assets/debug.png',
    log: '/assets/info.png',
    info: '/assets/info.png',
    warn: '/assets/warn.png',
    error: '/assets/error.png',

    success: '/assets/success.png',
  },
  term: (globalThis || window).document && document.querySelector('.term'),
  serialize(a) {
    try {
      if (typeof a === 'string') return a
      if (a instanceof Error) return a.toString()
      let ts = a.toString()
      if (ts.startsWith('[')) return JSON.stringify(a, null, 4)
      return ts
    } catch (err) {
      return JSON.stringify(a, null, 4)
    }
  },
  createElement(type, msg) {
    const termLine = document.createElement('div'),
      icon = document.createElement('img'),
      text = document.createElement('pre')
    termLine.className = 'term-line'
    icon.src = this.Icons[type] || this.Icons.debug
    icon.className = 'term-icon'
    text.innerText = msg
    termLine.append(icon, text)
    return termLine
  },
  log(type, ...args) {
    let msg = args.map(this.serialize).join(' ')
    let element = this.createElement(type, msg)
    this.term.append(element)
    element.scrollIntoView()
  },
}

const fns = ['debug', 'log', 'info', 'warn', 'error']

fns.forEach(key => {
  const orig = console[key]
  console[key] = function (...args) {
    orig(...args), Log.log(key, ...args)
  }
})

export default Log
