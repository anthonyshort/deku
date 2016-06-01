import createNativeElement from '@f/create-element'

export default class Pool {
  constructor() {
    this.storage = {}
    this._recyclingEnabled = false
  }

  store(el) {
    if (!this._recyclingEnabled) {
      return
    }

    if (el && el.parentNode) {
      el.parentNode.removeChild(el)
    }

    if (!el.nodeType || el.nodeType != Node.ELEMENT_NODE) {
      return
    }

    let tagName = el.tagName.toLowerCase()
    if (!this.storage[tagName]) {
      this.storage[tagName] = []
    }

    // little cleanup
    for (let i = 0; i < el.attributes.length; i++) {
      el.removeAttribute(el.attributes[i].name)
    }

    if (el.childNodes.length > 0) {
      for (let i = 0; i < el.childNodes.length; i++) {
        this.store(el.childNodes[i])
      }
    }

    this.storage[tagName].push(el)
  }

  enableRecycling(flag) {
    this._recyclingEnabled = flag
  }

  get(tagName) {
    tagName = tagName.toLowerCase()
    if (this._recyclingEnabled && this.storage[tagName] && this.storage[tagName].length > 0) {
      return this.storage[tagName].pop()
    }
    return createNativeElement(tagName)
  }

  preallocate(tagName, size) {
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
  _getStorageSizeFor(tagName) {
    return (this.storage[tagName] || []).length
  }
}

