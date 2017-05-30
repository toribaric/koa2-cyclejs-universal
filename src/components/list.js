import xs from 'xstream'
import isolate from '@cycle/isolate'
import { div, button } from '@cycle/dom'
import { getRequestWithState, getResponseWithState } from '../drivers/initialState'
import Item from './item'
import AddItem from './addItem'

function createItemWrapper (DOM) {
  return function itemWrapper (id, props) {
    const item = isolate(Item)({ DOM, Props: xs.of(props) })
    return {
      DOM: item.DOM,
      Remove: item.Remove.mapTo(id),
      Duplicate: item.Duplicate.mapTo(id)
    }
  }
}

function createAddItem (DOM, openModal$) {
  return isolate(AddItem)({ DOM, OpenModal: openModal$ })
}

function intent (domSource, itemRemove$, itemDuplicate$, openModal$) {
  return xs.merge(
    domSource.select('.add-button').events('click')
      .mapTo({type: 'OPEN_MODAL', component: createAddItem(domSource, openModal$)}),

    itemRemove$.map(id => ({type: 'REMOVE_ITEM', payload: id})),

    itemDuplicate$.map(id => ({type: 'DUPLICATE_ITEM', payload: id}))
  )
}

function model (action$, response$, itemWrapper) {
  let mutableLastId = 0

  function createNewItem (props) {
    const id = mutableLastId++
    const sinks = itemWrapper(id, props)
    return { id, props, DOM: sinks.DOM, Remove: sinks.Remove, Duplicate: sinks.Duplicate }
  }

  const initialStateReducer$ = response$
    .map(items => {
      return function initialStateReducer () {
        return items.map(item => createNewItem(item))
      }
    })

  const addItemReducer$ = action$
    .filter(a => a.type === 'OPEN_MODAL')
    .map(x => x.component.AddItem)
    .flatten()
    .map(action => {
      return function addItemReducer (listItems) {
        if (!action.payload) {
          return listItems
        }

        const newItem = createNewItem({ title: action.payload })
        return listItems.concat([newItem])
      }
    })

  const removeItemReducer$ = action$
    .filter(a => a.type === 'REMOVE_ITEM')
    .map(action => function removeItemReducer (listItems) {
      return listItems.filter(item => item.id !== action.payload)
    })

  const duplicateItemReducer$ = action$
    .filter(a => a.type === 'DUPLICATE_ITEM')
    .map(action => function duplicateItemReducer (listItems) {
      const [ item ] = listItems.filter(item => item.id === action.payload)
      const newItem = createNewItem({ ...item.props })
      return listItems.concat([newItem])
    })

  return xs.merge(initialStateReducer$, addItemReducer$, removeItemReducer$, duplicateItemReducer$)
    .fold((listItems, reducer) => reducer(listItems), [])
}

function view (state$) {
  const buttons = div('.buttons', [
    button('.add-button', 'Add new item')
  ])

  return state$.map(items => {
    const vnodes$ = items.map(item => item.DOM)
    return xs.combine(...vnodes$)
      .map(vnodes => div('.list-wrapper', [
        buttons,
        div('.list', vnodes)
      ]))
  }).flatten()
}

export default function List (sources) {
  const proxyItemRemove$ = xs.create()
  const proxyItemDuplicate$ = xs.create()
  const proxyOpenModal$ = xs.create()
  const itemWrapper = createItemWrapper(sources.DOM)
  const request$ = getRequestWithState(sources.initialState, sources.url, sources.category)
  const response$ = getResponseWithState(sources.initialState, sources.HTTP, sources.category)
  const action$ = intent(sources.DOM, proxyItemRemove$, proxyItemDuplicate$, proxyOpenModal$)
  const state$ = model(action$, response$, itemWrapper)
  const vtree$ = view(state$)
  const itemRemove$ = state$.map(items =>
    xs.merge(...items.map(item => item.Remove))
  ).flatten()
  const itemDuplicate$ = state$.map(items =>
    xs.merge(...items.map(item => item.Duplicate))
  ).flatten()

  const openModal$ = action$.filter(action => action.type === 'OPEN_MODAL')

  proxyItemRemove$.imitate(itemRemove$)
  proxyItemDuplicate$.imitate(itemDuplicate$)
  proxyOpenModal$.imitate(openModal$)

  return {
    DOM: vtree$,
    HTTP: request$,
    OpenModal: openModal$
  }
}
