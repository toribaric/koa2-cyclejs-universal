export function getDraggable (draggableSelector, vnode) {
  if (!vnode || !vnode.matches) {
    return null
  }

  if (vnode.matches(draggableSelector)) {
    return vnode
  }

  return getDraggable(draggableSelector, vnode.parentNode)
}

export function isTargetValid (target, excludedClasses) {
  if (!target.getAttribute('class')) {
    return true
  }

  return excludedClasses.reduce((acc, className) =>
    acc && target.getAttribute('class').indexOf(className) < 0, true)
}

export function getGhostNodeStyle (top, left, width, height) {
  return `width: ${width}px; height: ${height}; top: ${top}px; left: ${left}px;`
}

export function getNewVtree (vtree, container, newVnodes) {
  const vtreeChildren = vtree.children.map(child => {
    if (child === container) {
      return { ...child, children: newVnodes }
    }

    return child
  })

  return {
    ...vtree,
    children: vtreeChildren
  }
}
