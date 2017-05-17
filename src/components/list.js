import xs from 'xstream'
import isolate from '@cycle/isolate'
import { div, button } from '@cycle/dom'
import Item from './item'

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

function intent (domSource, itemRemove$, itemDuplicate$) {
  return xs.merge(
    domSource.select('.add-button').events('click')
      .mapTo({type: 'ADD_ITEM', payload: `Item ${Math.floor(Math.random() * 20)}`}),

    itemRemove$.map(id => ({type: 'REMOVE_ITEM', payload: id})),

    itemDuplicate$.map(id => ({type: 'DUPLICATE_ITEM', payload: id}))
  )
}

function model (action$, itemWrapper) {
  let mutableLastId = 0

  function createNewItem (props) {
    const id = mutableLastId++
    const sinks = itemWrapper(id, props)
    return { id, props, DOM: sinks.DOM, Remove: sinks.Remove, Duplicate: sinks.Duplicate }
  }

  const addItemReducer$ = action$
    .filter(a => a.type === 'ADD_ITEM')
    .map(action => {
      return function addItemReducer (listItems) {
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

  const initialState = [createNewItem({ title: 'Item 001' })]

  return xs.merge(addItemReducer$, removeItemReducer$, duplicateItemReducer$)
    .fold((listItems, reducer) => reducer(listItems), initialState)
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
  const itemWrapper = createItemWrapper(sources.DOM)
  const action$ = intent(sources.DOM, proxyItemRemove$, proxyItemDuplicate$)
  const state$ = model(action$, itemWrapper)
  const vtree$ = view(state$)
  const itemRemove$ = state$.map(items =>
    xs.merge(...items.map(item => item.Remove))
  ).flatten()
  const itemDuplicate$ = state$.map(items =>
    xs.merge(...items.map(item => item.Duplicate))
  ).flatten()

  proxyItemRemove$.imitate(itemRemove$)
  proxyItemDuplicate$.imitate(itemDuplicate$)

  return {
    DOM: vtree$
  }
}
