import { select } from 'snabbdom-selector'

export default function handleMouseUp (state, event, options) {
  const { vtree, draggable } = state
  if (!draggable) {
    return state
  }

  const index = Array.prototype.indexOf.call(draggable.parentNode.children, draggable)
  const container = select(options.containerSelector, vtree)[0]
  const items = container.children
  const newItems = [
    ...items.slice(0, index),
    { ...items[index], data: { attrs: { ...items[index].data.attrs, 'style': 'opacity: 1' } } },
    ...items.slice(index + 1, items.length - 1)
  ]
  const newVnodeChildren = vtree.children.map(child => {
    if (child === container) {
      return { ...child, children: newItems }
    }

    return child
  })

  const customEvent = new window.CustomEvent('nodesSorted', {
    bubbles: true,
    detail: {
      sortedNodes: newItems
    }
  })

  container.elm.dispatchEvent(customEvent)

  return {
    vtree: { ...vtree, children: newVnodeChildren },
    draggable: null
  }
}
