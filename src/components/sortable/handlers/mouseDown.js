import { select } from 'snabbdom-selector'
import {
  getDraggable,
  isTargetValid,
  getGhostNodeStyle,
  getNewVtree
} from '../utils'

function getNewDraggableVnode (draggableVnode) {
  return {
    ...draggableVnode,
    data: {
      attrs: {
        'data-id': draggableVnode.data.attrs['data-id'],
        'data-draggable': true,
        'style': 'opacity: 0'
      }
    }
  }
}

function getNewGhostVnode (draggableVnode, ghostNodeStyle, rect, event) {
  return {
    ...draggableVnode,
    elm: undefined,
    data: {
      attrs: {
        'class': draggableVnode.elm.className + ' ghost-element',
        'style': ghostNodeStyle,
        'data-width': rect.width,
        'data-height': rect.height,
        'data-top': rect.top,
        'data-left': rect.left,
        'data-previous-x': event.clientX,
        'data-previous-y': event.clientY
      }
    }
  }
}

function getNewVnodes (vnodes, draggable, event) {
  const rect = draggable.getBoundingClientRect()
  const ghostTop = rect.top + window.scrollY
  const ghostLeft = rect.left + window.scrollX
  const ghostNodeStyle = getGhostNodeStyle(ghostTop, ghostLeft, rect.width, rect.height)
  const draggableIndex = Array.prototype.indexOf.call(draggable.parentNode.children, draggable)
  const draggableVnode = vnodes[draggableIndex]
  const newDraggableVnode = getNewDraggableVnode(draggableVnode)
  const ghostVnode = getNewGhostVnode(draggableVnode, ghostNodeStyle, rect, event)
  return [
    ...vnodes.slice(0, draggableIndex),
    newDraggableVnode,
    ...vnodes.slice(draggableIndex + 1),
    ghostVnode
  ]
}

export default function handleMouseDown (state, event, options) {
  const { vtree } = state
  const draggable = getDraggable(options.draggableSelector, event.target)
  if (!isTargetValid(event.target, options.excludedClasses) || !draggable) {
    return state
  }

  const container = select(options.containerSelector, vtree)[0]
  const vnodes = container.children
  const newVnodes = getNewVnodes(vnodes, draggable, event)
  const newVtree = getNewVtree(vtree, container, newVnodes)
  return {
    vtree: newVtree,
    draggable
  }
}
