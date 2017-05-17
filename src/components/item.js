import xs from 'xstream'
import { div, h4, a } from '@cycle/dom'
import styles from './item.css'

function intent (DOM) {
  return xs.merge(
    DOM.select('.remove-button').events('click')
      .mapTo({ type: 'REMOVE' }),
    DOM.select('.duplicate-button').events('click')
      .mapTo({ type: 'DUPLICATE' })
  )
}

function model (props$) {
  return props$
}

function view (state$) {
  return state$.map(({ title }) => {
    return div(`.item ${styles.item}`, [
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
    Remove: action$.filter(action => action.type === 'REMOVE'),
    Duplicate: action$.filter(action => action.type === 'DUPLICATE')
  }
}
