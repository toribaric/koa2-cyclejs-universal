import xs from 'xstream'
import delay from 'xstream/extra/delay'
import isolate from '@cycle/isolate'
import AddItem from '../addItem'
import {
  REMOVE_LIST,
  REMOVE_ITEM,
  DUPLICATE_ITEM,
  ITEMS_SORTED,
  OPEN_MODAL
} from '../../constants'

export function createAddItem (DOM, openModal$) {
  return isolate(AddItem)({ DOM, OpenModal: openModal$ })
}

export default function intent (DOM, response$, { itemRemove$, itemDuplicate$, openModal$ }) {
  const action$ = xs.merge(
    DOM.select('.add-button').events('click')
      .mapTo({
        type: OPEN_MODAL,
        title: 'Add new item',
        component: createAddItem(DOM, openModal$)
      }),
    DOM.select('.remove-button').events('click')
      .mapTo({ type: REMOVE_LIST }),
    DOM.select('.list').events('vnodesSorted')
      .compose(delay(10))
      .map(ev => ({
        type: ITEMS_SORTED,
        payload: ev.detail.sortedVnodes
      })),
    itemRemove$.map(id => ({type: REMOVE_ITEM, payload: id})),
    itemDuplicate$.map(id => ({type: DUPLICATE_ITEM, payload: id}))
  )

  const addItemAction$ = action$
    .filter(a => a.type === OPEN_MODAL)
    .map(x => x.component.AddItem)
    .flatten()

  return xs.merge(action$, addItemAction$, response$)
}
