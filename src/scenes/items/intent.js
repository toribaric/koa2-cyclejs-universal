import xs from 'xstream'
import isolate from '@cycle/isolate'
import AddList from '../../components/addList'
import {
  OPEN_MODAL,
  REMOVE_LIST
} from '../../constants'

export function createAddList (DOM, openModal$) {
  return isolate(AddList)({ DOM, OpenModal: openModal$ })
}

export default function intent (DOM, response$, { openModal$, listRemove$ }) {
  const action$ = xs.merge(
    DOM.select('.add-button').events('click')
      .mapTo({
        type: OPEN_MODAL,
        title: 'Add new list',
        component: createAddList(DOM, openModal$)
      }),
    listRemove$.map(id => ({ type: REMOVE_LIST, payload: id }))
  )

  const addListAction$ = action$
    .filter(a => a.type === OPEN_MODAL)
    .map(x => x.component.AddList)
    .flatten()

  // must return a memory stream here as it has multiple
  // downstreams that sink to the DOM listener: first is
  // the state$ stream (model, state reducers), and second
  // is openModal$ which is a stream merged of this one and
  // of lists' OpenModal streams in order for the OPEN_MODAL
  // action to trigger modal dialogs for both adding new
  // items and new lists
  return xs
    .merge(action$, addListAction$, response$)
    .remember()
}
