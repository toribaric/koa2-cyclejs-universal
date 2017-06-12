import xs from 'xstream'
import { div, button, h4, a } from '@cycle/dom'
import createSortable from '../sortable'
import styles from './list.css'

export default function view (state$, { DOM, listId, listTitle }) {
  const buttons = div('.buttons', [
    button('.add-button', 'Add new item')
  ])

  // list vtree$ stream must be a memory stream as lists can be
  // dynamically added and removed and when a new list is added
  // it's vtree$ stream emits the virtual tree for the first time
  // when list's request$ stream is created and when it emits the
  // initial state event - and that happens before the new list's
  // vtree$ stream is merged with other lists' vtree$ streams in
  // the parent component. In order for it to emit again after it's
  // merged and after it gets the new downstream, it must be remembered.
  return state$
    .map(items => {
      const vnodes$ = items.map(item => item.DOM)
      return xs.combine(...vnodes$)
        .map(vnodes => div(`.list-wrapper ${styles['list-wrapper']}`, [
          div('.clearfix', [
            div('.pull-left', h4(listTitle)),
            div('.pull-right', [
              a('.remove-button', '(X) Remove list')
            ])
          ]),
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
    .remember()
}
