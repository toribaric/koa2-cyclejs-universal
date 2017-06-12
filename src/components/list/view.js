import xs from 'xstream'
import { div, button, h4 } from '@cycle/dom'
import createSortable from '../sortable'

export default function view (state$, DOM, listId) {
  const buttons = div('.buttons', [
    button('.add-button', 'Add new item')
  ])

  return state$
    .map(items => {
      const vnodes$ = items.map(item => item.DOM)
      return xs.combine(...vnodes$)
        .map(vnodes => div('.list-wrapper', [
          h4(`List No. ${listId}`),
          buttons,
          div('.list', vnodes)
        ]))
    })
    .flatten()
    .compose(createSortable(DOM, {
      containerSelector: '.list',
      draggableSelector: '.item',
      excludedClasses: ['remove-button', 'duplicate-button']
    }))
}
