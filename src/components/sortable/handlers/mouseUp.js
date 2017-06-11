import { select } from 'snabbdom-selector'
import {
  getNewVtree
} from '../utils'

function getNewDraggableVnode (vnodes, draggableIndex) {
  return {
    ...vnodes[draggableIndex],
    data: {
      attrs: {
        ...vnodes[draggableIndex].data.attrs,
        'style': 'opacity: 1'
      }
    }
  }
}

function dispatchEvent (container, newVnodes) {
  const customEvent = new window.CustomEvent('vnodesSorted', {
    bubbles: true,
    detail: {
      sortedVnodes: newVnodes
    }
  })

  container.elm.dispatchEvent(customEvent)
}

function getNewVnodes (vnodes, draggable, event) {
  const draggableIndex = Array.prototype.indexOf.call(draggable.parentNode.children, draggable)
  const newDraggableVnode = getNewDraggableVnode(vnodes, draggableIndex)
  const vnodesWithoutGhost = vnodes.slice(draggableIndex + 1, vnodes.length - 1)
  return [
    ...vnodes.slice(0, draggableIndex),
    newDraggableVnode,
    ...vnodesWithoutGhost
  ]
}

export default function handleMouseUp (state, event, options) {
  const { vtree, draggable } = state
  if (!draggable) {
    return state
  }

  const container = select(options.containerSelector, vtree)[0]
  const vnodes = container.children
  const newVnodes = getNewVnodes(vnodes, draggable, event)
  const newVtree = getNewVtree(vtree, container, newVnodes)

  dispatchEvent(container, newVnodes)

  return {
    vtree: newVtree,
    draggable: null
  }
}
