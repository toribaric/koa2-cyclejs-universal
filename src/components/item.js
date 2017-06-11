import xs from 'xstream'
import { div, h4, a } from '@cycle/dom'
import styles from './item.css'
import { REMOVE_ITEM, DUPLICATE_ITEM } from '../constants'

function intent (DOM) {
  return xs.merge(
    DOM.select('.remove-button').events('click')
      .mapTo({ type: REMOVE_ITEM }),
    DOM.select('.duplicate-button').events('click')
      .mapTo({ type: DUPLICATE_ITEM })
  )
}

function model (props$) {
  return props$
}

function view (state$) {
  return state$.map(({ id, title }) => {
    return div(`.item ${styles.item}`, { attrs: { 'data-id': id } }, [
      div('.header', [
        div('.pull-left', [ h4('', title) ]),
        div('.pull-right', [
          a(`.remove-button .${styles.removeButton}`, 'X'),
          a('.duplicate-button', 'DUP')
        ]),
        div('.clearfix')
      ])
    ])
  })
}

export default function Item (sources) {
  const action$ = intent(sources.DOM)
  const state$ = model(sources.Props)
  const vtree$ = view(state$)

  return {
    DOM: vtree$,
    Remove: action$.filter(action => action.type === REMOVE_ITEM),
    Duplicate: action$.filter(action => action.type === DUPLICATE_ITEM)
  }
}
