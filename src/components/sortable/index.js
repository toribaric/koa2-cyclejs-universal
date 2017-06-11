import xs from 'xstream'
import handle from './handlers'

export default function createSortable (DOM, options) {
  return vtree$ => {
    return vtree$
      .map(vtree => {
        const event$ = xs.merge(
          DOM.select(options.containerSelector).events('mousedown'),
          DOM.select('body').events('mouseup'),
          DOM.select('body').events('mousemove')
        )

        return event$
          .fold((acc, event) => handle(acc, event, options), { vtree, draggable: null })
          .map(state => state.vtree)
      }).flatten()
  }
}
