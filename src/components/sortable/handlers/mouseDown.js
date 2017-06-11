import { select } from 'snabbdom-selector'
import { getDraggable, isTargetValid } from '../utils'

export default function handleMouseDown (state, event, options) {
  const { vtree } = state
  const draggable = getDraggable(options.draggableSelector, event.target)
  if (!isTargetValid(event.target, options.excludedClasses) || !draggable) {
    return state
  }

  const draggableRect = draggable.getBoundingClientRect()

  const ghostElementStyle = 'z-index: 5; margin: 0; pointer-events: none; position: absolute; background: red; opacity: 0.5; width: '
    + draggableRect.width + 'px; ' + 'height: ' + draggableRect.height + 'px; top: '
    + (draggableRect.top + window.scrollY) + 'px; left: '
    + (draggableRect.left + window.scrollX) + 'px;'

  const container = select(options.containerSelector, vtree)[0]
  const items = container.children
  const index = Array.prototype.indexOf.call(draggable.parentNode.children, draggable)
  const newItems = [
    ...items.slice(0, index),
    { ...items[index], data: { attrs: { 'data-id': draggable.getAttribute('data-id'), 'data-draggable': true, 'style': 'opacity: 0' } } },
    ...items.slice(index + 1),
    {
      ...items[index],
      elm: undefined,
      data: {
        attrs: {
          'style': ghostElementStyle,
          'data-width': draggableRect.width,
          'data-height': draggableRect.height,
          'data-top': draggableRect.top,
          'data-left': draggableRect.left,
          'data-previous-x': event.clientX,
          'data-previous-y': event.clientY
        }
      }
    }
  ]
  const newVnodeChildren = vtree.children.map(child => {
    if (child === container) {
      return { ...child, children: newItems }
    }

    return child
  })

  return {
    vtree: { ...vtree, children: newVnodeChildren },
    draggable
  }
}
