import { select } from 'snabbdom-selector'

export default function handleMouseMove (state, event, options) {
  const { vtree, draggable } = state
  if (!draggable) {
    return state
  }

  const container = select(options.containerSelector, vtree)[0]
  const items = container.children
  const ghost = items[items.length - 1]

  let newY = ghost.data.attrs['data-top'] + (event.clientY - ghost.data.attrs['data-previous-y'])
  let newX = ghost.data.attrs['data-left'] + (event.clientX - ghost.data.attrs['data-previous-x'])

  if (newX < 0) {
    newX = 0
  }

  if (newY < 0) {
    newY = 0
  }

  const ghostElementStyle = 'z-index: 5; margin: 0; pointer-events: none; position: absolute; background: red; opacity: 0.5; width: '
  + ghost.data.attrs['data-width'] + 'px; ' + 'height: ' + ghost.data.attrs['data-height'] + 'px; top: '
  + (newY + window.scrollY) + 'px; left: '
  + (newX + window.scrollX) + 'px;'

  const newItems1 = items.slice(0, items.length - 1).reduce((acc1, item, i) => {
    const rect = item.elm.getBoundingClientRect()

    if (acc1.indexOf(item) < 0) {
      acc1.push(item)
    }

    const previousElement = i === 0 ? null : items[i - 1]
    const previousDraggable = previousElement ? previousElement.data.attrs && previousElement.data.attrs['data-draggable'] : false

    const nextElement = i === items.length - 1 ? null : items[i + 1]
    const nextDraggable = nextElement ? nextElement.data.attrs && nextElement.data.attrs['data-draggable'] : false

    if (previousDraggable && newY > rect.top) {
      acc1[i] = previousElement
      acc1[i - 1] = item
    }

    if (nextDraggable && newY < rect.top) {
      acc1[i] = nextElement
      acc1.push(item)
    }

    return acc1
  }, [])

  const newItems = [
    ...newItems1,
    { ...ghost,
      data: {
        attrs: {
          ...ghost.data.attrs,
          'data-top': newY,
          'data-left': newX,
          'data-previous-x': event.clientX,
          'data-previous-y': event.clientY,
          'style': ghostElementStyle
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
