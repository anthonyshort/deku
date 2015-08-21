import isDom from 'is-dom'
import uid from 'get-uid'
import keypath from 'object-path'
import svg from './svg'
import forEach from 'fast.js/forEach'
import reduce from 'fast.js/reduce'
import nodeType from './node-type'
import {
  setAttribute,
  removeAttribute,
  isWithinPath,
  removeAllChildren,
  isElement,
  addEvent,
  removeEvent,
  canSelectText,
  setElementValue,
  insertAtIndex
} from './dom'

/**
 * Render an app to the DOM
 *
 * @param {Application} app
 * @param {HTMLElement} container
 * @param {Object} opts
 *
 * @return {Object}
 */

export default function render (app, container) {
  var tree = {
    id: 'root',
    virtualElement: null,
    nativeElement: null,
    children: {}
  }

  if (!isDom(container)) {
    throw new Error('Container element must be a DOM element')
  }

  if (container.children.length > 0) {
    console.info('The container element is not empty. These elements will be removed.')
  }

  if (container === document.body) {
    console.warn('Using document.body is allowed but it can cause some issues.')
  }

  /**
   * Watch for changes to the app so that we can update
   * the DOM as needed.
   */

  app.on('unmount', onunmount)
  app.on('mount', render)

  /**
   * If the app has already mounted an element, we can just
   * render that straight away.
   */

  if (app.element) render()

  /**
   * Teardown the DOM rendering so that it stops
   * rendering and everything can be garbage collected.
   */

  function teardown () {
    removeNativeElement()
    app.off('unmount', onunmount)
    app.off('mount', render)
  }

  /**
   * If the app unmounts an element, we should clear out the current
   * rendered element. This will remove all the entities.
   */

  function onunmount () {
    removeNativeElement()
    tree.virtualElement = null
  }

  /**
   * Remove a component from the native dom.
   *
   * @param {Entity} entity
   */

  function unmountEntity (entity) {
    if (!entity) return
    trigger('beforeUnmount', entity)
    unmountChildren(entity)
  }

  /**
   * Render the entity and make sure it returns a node
   *
   * @param {Entity} entity
   *
   * @return {VirtualTree}
   */

  function renderEntity ({component, props}) {
    let fn = typeof component === 'function' ? component : component.render
    if (!fn) throw new Error('Component needs a render function')
    let result = fn(props)
    if (!result) throw new Error('Render function must return an element.')
    return result
  }

  /**
   * Update the DOM. If the update fails we stop the loop
   * so we don't get errors on every frame.
   *
   * @api public
   */

  function render () {
    let {nativeElement, virtualElement} = tree

    if (!nativeElement) {
      nativeElement = toNative(tree, '0', app.element)
      removeAllChildren(container)
      container.appendChild(nativeElement)
    } else {
      nativeElement = patch(tree, virtualElement, app.element, nativeElement)
    }

    tree = { ...tree, nativeElement, virtualElement: app.element }
  }

  /**
   * Update a component by re-rendering it. If the same vnode
   * is return we can just skip patching the DOM element.
   */

  function updateEntity (entity) {
    var currentTree = entity.virtualElement
    var nextTree = renderEntity(entity)
    if (nextTree === currentTree) return updateChildren(entity)
    entity.nativeElement = patch(entity, currentTree, nextTree, entity.nativeElement)
    entity.virtualElement = nextTree
  }

  /**
   * Update all the children of an entity.
   *
   * @param {String} id Component instance id.
   */

  function updateChildren (entity) {
    forEach(entity.children, updateEntity)
  }

  /**
   * Remove all of the child entities of an entity
   *
   * @param {Entity} entity
   */

  function unmountChildren (entity) {
    forEach(entity.children, unmountEntity)
  }

  /**
   * Remove the root element. If this is called synchronously we need to
   * cancel any pending future updates.
   */

  function removeNativeElement () {
    removeElement(tree, '0', tree.nativeElement)
    tree.nativeElement = null
  }

  /**
   * Create a native element from a virtual element.
   *
   * @param {String} entityId
   * @param {String} path
   * @param {Object} vnode
   *
   * @return {HTMLDocumentFragment}
   */

  function toNative (entity, path, vnode) {
    switch (nodeType(vnode)) {
      case 'text': return toNativeText(vnode)
      case 'empty': return toNativeEmptyElement()
      case 'element': return toNativeElement(entity, path, vnode)
      case 'component':
        let {nativeElement} = toNativeComponent(entity, path, vnode)
        return nativeElement
    }
  }

  /**
   * Create a native text element from a virtual element.
   *
   * @param {Object} vnode
   */

  function toNativeText (text) {
    return document.createTextNode(text)
  }

  /**
   * Create a native element from a virtual element.
   */

  function toNativeElement (entity, path, vnode) {
    var el
    var attributes = vnode.attributes
    var tagName = vnode.type
    var childNodes = vnode.children

    // create element either from pool or fresh.
    if (svg.isElement(tagName)) {
      el = document.createElementNS(svg.namespace, tagName)
    } else {
      el = document.createElement(tagName)
    }

    // set attributes.
    forEach(attributes, function (value, name) {
      setAttribute(el, name, value)
    })

    // add children.
    forEach(childNodes, function (child, i) {
      var childEl = toNative(entity, path + '.' + i, child)
      if (!childEl.parentNode) el.appendChild(childEl)
    })

    return el
  }

  /**
   * Create a native element from a virtual element.
   */

  function toNativeEmptyElement () {
    return document.createElement('noscript')
  }

  /**
   * Create a native element from a component.
   */

  function toNativeComponent (owner, path, vnode) {
    var entity = Entity(vnode.type, { ...vnode.attributes, children: vnode.children })
    owner.children[path] = entity

    trigger('validate', entity)

    var virtualElement = renderEntity(entity)
    var nativeElement = toNative(entity, '0', virtualElement)

    entity.virtualElement = virtualElement
    entity.nativeElement = nativeElement

    trigger('afterMount', entity)

    return entity
  }

  /**
   * Patch an element with the diff from two trees.
   */

  function patch (entity, prev, next, el) {
    return diffNode('0', entity, prev, next, el)
  }

  /**
   * Create a diff between two trees of nodes.
   */

  function diffNode (path, entity, prev, next, el) {
    var leftType = nodeType(prev)
    var rightType = nodeType(next)

    // Type changed. This could be from element->text, text->ComponentA,
    // ComponentA->ComponentB etc. But NOT div->span. These are the same type
    // (ElementNode) but different tag name.
    if (leftType !== rightType) return replaceElement(entity, path, el, next)

    switch (rightType) {
      case 'text': return diffText(prev, next, el)
      case 'empty': return el
      case 'element': return diffElement(path, entity, prev, next, el)
      case 'component': return diffComponent(path, entity, prev, next, el)
    }
  }

  /**
   * Diff two text nodes and update the element.
   */

  function diffText (previous, current, el) {
    if (current !== previous) el.data = current
    return el
  }

  /**
   * Diff the children of an ElementNode.
   */

  function diffChildren (path, entity, prev, next, el) {
    var positions = []
    var hasKeys = false
    var childNodes = Array.prototype.slice.apply(el.childNodes)
    var leftKeys = reduce(prev.children, keyMapReducer, {})
    var rightKeys = reduce(next.children, keyMapReducer, {})
    var currentChildren = { ...entity.children }

    function keyMapReducer (acc, child, i) {
      if (child && child.attributes && child.attributes.key != null) {
        acc[child.attributes.key] = {
          element: child,
          index: i
        }
        hasKeys = true
      }
      return acc
    }

    // Diff all of the nodes that have keys. This lets us re-used elements
    // instead of overriding them and lets us move them around.
    if (hasKeys) {

      // Removals
      forEach(leftKeys, function (leftNode, key) {
        if (rightKeys[key] == null) {
          var leftPath = path + '.' + leftNode.index
          removeElement(
            entity,
            leftPath,
            childNodes[leftNode.index]
          )
        }
      })

      // Update nodes
      forEach(rightKeys, function (rightNode, key) {
        var leftNode = leftKeys[key]

        // We only want updates for now
        if (leftNode == null) return

        var leftPath = path + '.' + leftNode.index

        // Updated
        positions[rightNode.index] = diffNode(
          leftPath,
          entity,
          leftNode.element,
          rightNode.element,
          childNodes[leftNode.index]
        )
      })

      // Update the positions of all child components and event handlers
      forEach(rightKeys, function (rightNode, key) {
        var leftNode = leftKeys[key]

        // We just want elements that have moved around
        if (leftNode == null || leftNode.index === rightNode.index) return

        var rightPath = path + '.' + rightNode.index
        var leftPath = path + '.' + leftNode.index

        // Update all the child component path positions to match
        // the latest positions if they've changed. This is a bit hacky.
        forEach(currentChildren, function (child, childPath) {
          if (leftPath === childPath) {
            delete entity.children[childPath]
            entity.children[rightPath] = child
          }
        })
      })

      // Now add all of the new nodes last in case their path
      // would have conflicted with one of the previous paths.
      forEach(rightKeys, function (rightNode, key) {
        var rightPath = path + '.' + rightNode.index
        if (leftKeys[key] == null) {
          positions[rightNode.index] = toNative(
            entity,
            rightPath,
            rightNode.element
          )
        }
      })

    } else {
      var maxLength = Math.max(prev.children.length, next.children.length)

      // Now diff all of the nodes that don't have keys
      for (var i = 0; i < maxLength; i++) {
        var leftNode = prev.children[i]
        var rightNode = next.children[i]

        // Removals
        if (rightNode === undefined) {
          removeElement(
            entity,
            path + '.' + i,
            childNodes[i]
          )
          continue
        }

        // New Node
        if (leftNode === undefined) {
          positions[i] = toNative(
            entity,
            path + '.' + i,
            rightNode
          )
          continue
        }

        // Updated
        positions[i] = diffNode(
          path + '.' + i,
          entity,
          leftNode,
          rightNode,
          childNodes[i]
        )
      }
    }

    // Reposition all the elements
    forEach(positions, function (childEl, newPosition) {
      var target = el.childNodes[newPosition]
      if (childEl && childEl !== target) {
        if (target) {
          el.insertBefore(childEl, target)
        } else {
          el.appendChild(childEl)
        }
      }
    })
  }

  /**
   * Diff the attributes and add/remove them.
   */

  function diffAttributes (prev, next, el, entity, path) {
    var nextAttrs = next.attributes
    var prevAttrs = prev.attributes

    // add new attrs
    forEach(nextAttrs, (value, name) => {
      setAttribute(el, name, value, prevAttrs[name])
    })

    // remove old attrs
    forEach(prevAttrs, (value, name) => {
      if (!(name in nextAttrs)) {
        removeAttribute(el, name, nextAttrs[name], value)
      }
    })
  }

  /**
   * Update a component with the props from the next node. If
   * the component type has changed, we'll just remove the old one
   * and replace it with the new component.
   */

  function diffComponent (path, entity, prev, next, el) {
    if (next.type !== prev.type) {
      return replaceElement(entity, path, el, next)
    } else {
      var target = entity.children[path]
      if (target) {
        updateEntityProps(target, { ...next.attributes, children: next.children })
        updateEntity(target)
        return target.nativeElement
      } else {
        return el
      }
    }
  }

  /**
   * Diff two element nodes.
   */

  function diffElement (path, entity, prev, next, el) {
    if (next.type !== prev.type) return replaceElement(entity, path, el, next)
    diffAttributes(prev, next, el, entity, path)
    diffChildren(path, entity, prev, next, el)
    return el
  }

  /**
   * Removes an element from the DOM and unmounts and components
   * that are within that branch
   *
   * side effects:
   *   - removes element from the DOM
   *   - removes internal references
   *
   * @param {String} entityId
   * @param {String} path
   * @param {HTMLElement} el
   */

  function removeElement (entity, path, el) {
    var childrenByPath = entity.children
    var child = childrenByPath[path]
    var removals = []

    // If the path points to a component we should use that
    // components element instead, because it might have moved it.
    if (child) {
      el = child.nativeElement
      unmountEntity(child)
      removals.push(path)
    } else {

      // Just remove the text node
      if (!isElement(el)) return el && el.parentNode.removeChild(el)

      // Then we need to find any components within this
      // branch and unmount them.
      forEach(childrenByPath, function (child, childPath) {
        if (childPath === path || isWithinPath(path, childPath)) {
          unmountEntity(child)
          removals.push(childPath)
        }
      })
    }

    // Remove the paths from the object without touching the
    // old object. This keeps the object using fast properties.
    forEach(removals, function (path) {
      delete entity.children[path]
    })

    // Remove it from the DOM
    el.parentNode.removeChild(el)
  }

  /**
   * Replace an element in the DOM. Removing all components
   * within that element and re-rendering the new virtual node.
   *
   * @param {Entity} entity
   * @param {String} path
   * @param {HTMLElement} el
   * @param {Object} vnode
   *
   * @return {void}
   */

  function replaceElement (entity, path, el, vnode) {
    var parent = el.parentNode
    var index = Array.prototype.indexOf.call(parent.childNodes, el)
    removeElement(entity, path, el)
    var newEl = toNative(entity, path, vnode)
    insertAtIndex(parent, index, newEl)
    return newEl
  }

  /**
   * Trigger a hook on a component.
   *
   * @param {String} name Name of hook.
   * @param {Entity} entity The component instance.
   * @param {Array} args To pass along to hook.
   */

  function trigger (name, entity) {
    var hook = entity.component[name]
    if (typeof hook === 'function') {
      hook(entity.props)
    }
  }

  /**
   * Update an entity to match the latest rendered vode. We always
   * replace the props on the component when composing them. This
   * will trigger a re-render on all children below this point.
   *
   * @param {Entity} entity
   * @param {String} path
   * @param {Object} vnode
   *
   * @return {void}
   */

  function updateEntityProps (entity, nextProps) {
    entity.props = nextProps
    trigger('validate', entity)
  }

  /**
   * Return an object that lets us completely remove the automatic
   * DOM rendering and export debugging tools.
   */

  return {
    remove: teardown
  }
}

/**
 * A rendered component instance.
 */

function Entity (component, props = {}) {
  return {
    id: uid(),
    component: component,
    props: props,
    virtualElement: null,
    nativeElement: null,
    children: {}
  }
}