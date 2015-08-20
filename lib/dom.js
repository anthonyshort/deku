var events = require('./events')
var svg = require('./svg')

/**
 * Retrieve the nearest 'body' ancestor of the given element or else the root
 * element of the document in which stands the given element.
 *
 * This is necessary if you want to attach the events handler to the correct
 * element and be able to dispatch events in document fragments such as
 * Shadow DOM.
 *
 * @param  {HTMLElement} el The element on which we will render an app.
 * @return {HTMLElement}    The root element on which we will attach the events
 *                          handler.
 */

exports.getRootElement = function (el) {
  while (el.parentElement) {
    if (el.tagName === 'BODY' || !el.parentElement) {
      return el
    }
    el = el.parentElement
  }
  return el
}

/**
 * Set the value property of an element and keep the text selection
 * for input fields.
 *
 * @param {HTMLElement} el
 * @param {String} value
 */

exports.setElementValue = function (el, value) {
  if (el === document.activeElement && exports.canSelectText(el)) {
    var start = el.selectionStart
    var end = el.selectionEnd
    el.value = value
    el.setSelectionRange(start, end)
  } else {
    el.value = value
  }
}

/**
 * For some reason only certain types of inputs can set the selection range.
 *
 * @param {HTMLElement} el
 *
 * @return {Boolean}
 */

exports.canSelectText = function (el) {
  return el.tagName === 'INPUT' && ['text','search','password','tel','url'].indexOf(el.type) > -1
}

/**
 * Bind events for an element, and all it's rendered child elements.
 *
 * @param {String} path
 * @param {String} event
 * @param {Function} fn
 */

exports.addEvent = function (el, eventType, fn) {
  el.addEventListener(eventType, fn)
}

/**
 * Unbind events for a entityId
 *
 * @param {String} entityId
 */

exports.removeEvent = function (el, eventType, fn) {
  el.removeEventListener(eventType, fn)
}

/**
 * Is the DOM node an element node
 *
 * @param {HTMLElement} el
 *
 * @return {Boolean}
 */

exports.isElement = function (el) {
  return !!(el && el.tagName)
}

/**
 * Remove all the child nodes from an element
 *
 * @param {HTMLElement} el
 */

exports.removeAllChildren = function (el) {
  while (el.firstChild) el.removeChild(el.firstChild)
}

/**
 * Checks to see if one tree path is within
 * another tree path. Example:
 *
 * 0.1 vs 0.1.1 = true
 * 0.2 vs 0.3.5 = false
 *
 * @param {String} target
 * @param {String} path
 *
 * @return {Boolean}
 */

exports.isWithinPath = function (target, path) {
  return path.indexOf(target + '.') === 0
}


/**
 * Set the attribute of an element, performing additional transformations
 * dependning on the attribute name
 *
 * @param {HTMLElement} el
 * @param {String} name
 * @param {String} value
 */

exports.setAttribute = function (el, name, value, previousValue) {
  if (previousValue === value) {
    return
  }
  if (typeof value === 'function' && !events[name]) {
    value = value(el)
  }
  if (!value) {
    exports.removeAttribute(el, name, previousValue)
    return
  }
  if (events[name]) {
    if (previousValue) exports.removeEvent(el, events[name], previousValue)
    exports.addEvent(el, events[name], value)
    return
  }
  switch (name) {
    case 'checked':
    case 'disabled':
    case 'selected':
      el[name] = true
      break
    case 'innerHTML':
      el.innerHTML = value
      break
    case 'value':
      exports.setElementValue(el, value)
      break
    case svg.isAttribute(name):
      el.setAttributeNS(svg.namespace, name, value)
      break
    default:
      el.setAttribute(name, value)
      break
  }
}

/**
 * Remove an attribute, performing additional transformations
 * dependning on the attribute name
 *
 * @param {HTMLElement} el
 * @param {String} name
 */

exports.removeAttribute = function (el, name, value) {
  if (events[name] && value) {
    exports.removeEvent(el, events[name], value)
    return
  }
  switch (name) {
    case 'checked':
    case 'disabled':
    case 'selected':
      el[name] = false
      break
    case 'innerHTML':
      el.innerHTML = ''
    case 'value':
      exports.setElementValue(el, null)
      break
    default:
      el.removeAttribute(name)
      break
  }
}

exports.insertAtIndex = function (parent, index, el) {
  var target = parent.childNodes[index]
  if (target) {
    parent.insertBefore(el, target)
  } else {
    parent.appendChild(el)
  }
}