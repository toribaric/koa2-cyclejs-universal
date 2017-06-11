import { select } from 'snabbdom-selector'
import {
  getGhostNodeStyle,
  getNewVtree
} from '../utils'

function getNewGhostVnode (ghostVnode, ghostNodeStyle, data) {
  return {
    ...ghostVnode,
    data: {
      attrs: {
        ...ghostVnode.data.attrs,
        'data-top': data.top,
        'data-left': data.left,
        'data-previous-x': data.previousX,
        'data-previous-y': data.previousY,
        'style': ghostNodeStyle
      }
    }
  }
}

function getTopAndLeft (ghostVnode, event) {
  const top = ghostVnode.data.attrs['data-top']
  const left = ghostVnode.data.attrs['data-left']
  const previousY = ghostVnode.data.attrs['data-previous-y']
  const previousX = ghostVnode.data.attrs['data-previous-x']
  const newTop = top + (event.clientY - previousY)
  const newLeft = left + (event.clientX - previousX)
  if (newTop < 0) {
    return { top: 0, left: newLeft }
  }

  if (newLeft < 0) {
    return { top: newTop, left: 0 }
  }

  return { top: newTop, left: newLeft }
}

function isPreviousVnodeDraggable (previousVnode) {
  return previousVnode
    ? previousVnode.data.attrs && previousVnode.data.attrs['data-draggable']
    : false
}

function isFollowingVnodeDraggable (followingVnode) {
  return followingVnode
    ? followingVnode.data.attrs && followingVnode.data.attrs['data-draggable']
    : false
}

function getSwappedVnodes (vnodes, top) {
  return vnodes.reduce((swappedVnodes, vnode, i) => {
    if (swappedVnodes.indexOf(vnode) < 0) {
      swappedVnodes.push(vnode)
    }

    const rect = vnode.elm.getBoundingClientRect()
    const previousVnode = i === 0 ? null : vnodes[i - 1]
    const followingVnode = i === vnodes.length - 1 ? null : vnodes[i + 1]

    if (isPreviousVnodeDraggable(previousVnode) && top > rect.top) {
      swappedVnodes[i] = previousVnode
      swappedVnodes[i - 1] = vnode
    }

    if (isFollowingVnodeDraggable(followingVnode) && top < rect.top) {
      swappedVnodes[i] = followingVnode
      swappedVnodes.push(vnode)
    }

    return swappedVnodes
  }, [])
}

function getNewVnodes (vnodes, ghostVnode, event) {
  const { top, left } = getTopAndLeft(ghostVnode, event)
  const ghostTop = top + window.scrollY
  const ghostLeft = left + window.scrollX
  const ghostWidth = ghostVnode.data.attrs['data-width']
  const ghostHeight = ghostVnode.data.attrs['data-height']
  const ghostNodeStyle = getGhostNodeStyle(ghostTop, ghostLeft, ghostWidth, ghostHeight)
  const ghostData = { top, left, previousX: event.clientX, previousY: event.clientY }
  const vnodesWithoutGhost = vnodes.slice(0, vnodes.length - 1)
  const swappedVnodes = getSwappedVnodes(vnodesWithoutGhost, top)
  const newGhostVnode = getNewGhostVnode(ghostVnode, ghostNodeStyle, ghostData)
  return [
    ...swappedVnodes,
    newGhostVnode
  ]
}

export default function handleMouseMove (state, event, options) {
  const { vtree, draggable } = state
  if (!draggable) {
    return state
  }

  const container = select(options.containerSelector, vtree)[0]
  const vnodes = container.children
  const ghostVnode = vnodes[vnodes.length - 1]
  const newVnodes = getNewVnodes(vnodes, ghostVnode, event)
  const newVtree = getNewVtree(vtree, container, newVnodes)
  return {
    vtree: newVtree,
    draggable
  }
}
