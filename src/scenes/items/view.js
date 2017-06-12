import xs from 'xstream'
import { div, section, h1, button } from '@cycle/dom'
import Menu from '../../components/menu'
import styles from './items.css'

export default function view (state$, modal, sources) {
  const buttons = div('.buttons', [
    button(`.add-button ${styles.listAddButton}`, 'Add new list')
  ])
  return state$
    .map(lists => xs.combine(modal.DOM, ...lists.map(list => list.DOM)))
    .flatten()
    .map(([ modal, ...lists ]) => {
      return div([
        Menu(sources),
        section(`.items ${styles.items}`, [
          div('.clearfix', [
            div('.pull-left', h1('Your items')),
            div('.pull-left', buttons)
          ]),
          modal
        ]),
        ...lists
      ])
    })
}
