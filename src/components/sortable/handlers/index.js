import handleMouseDown from './mouseDown'
import handleMouseMove from './mouseMove'
import handleMouseUp from './mouseUp'

export default function handle (state, event, options) {
  event.preventDefault()

  const eventTypeHandlers = {
    mousedown: handleMouseDown,
    mousemove: handleMouseMove,
    mouseup: handleMouseUp
  }

  return eventTypeHandlers[event.type](state, event, options)
}
