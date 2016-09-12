import createNativeElement from '@f/create-element'

export default class Pool {
  constructor () {
    this.storage = {}
    this._recyclingEnabled = false
  }

  store (el) {
    if (!this._recyclingEnabled || el._collected || !el.nodeType || el.nodeType !== 1 /* Node.ELEMENT_NODE == 1 */) {
      return
    }
    el._collected = true

    if (el && el.parentNode) {
      el.parentNode.removeChild(el)
    }

    let tagName = el.tagName.toLowerCase()
    if (!this.storage[tagName]) {
      this.storage[tagName] = []
    }

    // little cleanup
    el.className = ''
    for (let i = 0; i < el.attributes.length; i++) {
      el.removeAttribute(el.attributes[i].name)
    }

    if (el.childNodes.length > 0) {
      // Iterate backwards, because childNodes is live collection
      for (let i = el.childNodes.length - 1; i >= 0; i--) {
        this.store(el.childNodes[i])
      }
    }

    this.storage[tagName].push(el)
  }

  enableRecycling (flag) {
    this._recyclingEnabled = flag
  }

  get (tagName) {
    tagName = tagName.toLowerCase()
    if (this._recyclingEnabled && this.storage[tagName] && this.storage[tagName].length > 0) {
      let el = this.storage[tagName].pop()
      delete el._collected
      return el
    }
    return createNativeElement(tagName)
  }

  preallocate (tagName, size) {
    if (!this._recyclingEnabled) {
      return
    }

    tagName = tagName.toLowerCase()
    if (this.storage[tagName] && this.storage[tagName].length >= size) {
      return
    }

    if (!this.storage[tagName]) {
      this.storage[tagName] = []
    }

    let difference = size - this.storage[tagName].length
    for (let i = 0; i < difference; i++) {
      this.store(createNativeElement(tagName), false)
    }
  }

  // for tests only
  _getStorageSizeFor (tagName) {
    return (this.storage[tagName] || []).length
  }
}

