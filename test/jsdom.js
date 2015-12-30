import jsdom from 'jsdom'

const html = '<!docytpe html><html><head><meta charset="utf-8"></head><body></body></html>'
const blacklist = [ 'constructor', 'console' ]

jsdom.env({ done, html })

function done (errors, window) {
  Object.keys(window).forEach((key) => {
    if (blacklist.indexOf(key) === -1) global[key] = window[key]
  })

  global.window = window
  window.console = global.console

  require('./index')
}
