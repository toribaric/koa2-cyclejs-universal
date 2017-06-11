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
