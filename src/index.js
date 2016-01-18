import * as diff from './diff'
import * as vnode from './element'
import * as string from './string'
import * as dom from './dom'
import * as app from './app'

const element = vnode.create
const h = vnode.create

export {
  element,
  string,
  vnode,
  diff,
  app,
  dom,
  h
}
