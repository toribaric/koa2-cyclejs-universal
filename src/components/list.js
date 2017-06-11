import xs from 'xstream'
import delay from 'xstream/extra/delay'
import isolate from '@cycle/isolate'
import { div, button, h4 } from '@cycle/dom'
import {
  getRequestWithState,
  getResponseWithState,
  INITIAL_STATE
} from '../drivers/initialState'
import createSortable from './sortable'
import Item from './item'
import AddItem from './addItem'
import {
  ADD_ITEM,
  ITEM_ADDED,
  REMOVE_ITEM,
  DUPLICATE_ITEM,
  ITEMS_SORTED,
  OPEN_MODAL,
  BASE_PATH,
  ADD_ITEM_PATH,
  SORT_ITEMS_PATH,
  DELETE_ITEM_PATH,
  DUPLICATE_ITEM_PATH
} from '../constants'

function getItemsIds (items) {
  return items.map(item => parseInt(item.data.attrs['data-id']))
}

function createAddItem (DOM, openModal$) {
  return isolate(AddItem)({ DOM, OpenModal: openModal$ })
}

function createNewItem (DOM, item) {
  const props = { id: item.id, title: item.title }
  const component = isolate(Item)({ DOM, Props: xs.of(props) })
  return {
    id: item.id,
    props,
    DOM: component.DOM,
    Remove: component.Remove.mapTo(item.id),
    Duplicate: component.Duplicate.mapTo(item.id)
  }
}

function getRequest (action$, { initialState, url, category, listId }) {
  const initial$ = getRequestWithState(initialState, url, category)
  const mutation$ = action$.map(action => {
    if (action.type === ADD_ITEM && action.payload) {
      return {
        url: `${BASE_PATH}${ADD_ITEM_PATH}`
          .replace(':listId', listId),
        method: 'POST',
        send: { title: action.payload },
        category: 'add-item'
      }
    }

    if (action.type === REMOVE_ITEM) {
      return {
        url: `${BASE_PATH}${DELETE_ITEM_PATH}`
          .replace(':listId', listId)
          .replace(':id', action.payload),
        method: 'DELETE',
        category: 'delete-item'
      }
    }

    if (action.type === DUPLICATE_ITEM) {
      return {
        url: `${BASE_PATH}${DUPLICATE_ITEM_PATH}`
          .replace(':listId', listId)
          .replace(':id', action.payload),
        method: 'POST',
        category: 'duplicate-item'
      }
    }

    if (action.type === ITEMS_SORTED) {
      return {
        url: `${BASE_PATH}${SORT_ITEMS_PATH}`
          .replace(':listId', listId),
        method: 'POST',
        send: getItemsIds(action.payload),
        category: 'sort-items'
      }
    }

    return {}
  })

  return xs.merge(initial$, mutation$)
}

function getResponse ({ HTTP, initialState, category }) {
  return xs.merge(
    getResponseWithState(initialState, HTTP, category),
    xs.merge(HTTP.select('add-item'), HTTP.select('duplicate-item'))
      .flatten()
      .map(res => ({ type: ITEM_ADDED, payload: JSON.parse(res.text) }))
  )
}

function intent (DOM, response$, { itemRemove$, itemDuplicate$, openModal$ }) {
  const action$ = xs.merge(
    DOM.select('.add-button').events('click')
      .mapTo({
        type: OPEN_MODAL,
        title: 'Add new item',
        component: createAddItem(DOM, openModal$)
      }),
    DOM.select('.list').events('nodesSorted')
      .compose(delay(10))
      .map(ev => ({
        type: ITEMS_SORTED,
        payload: ev.detail.sortedNodes
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

function model (DOM, action$) {
  const initialStateReducer$ = action$
    .filter(a => a.type === INITIAL_STATE)
    .map(action => {
      return function initialStateReducer () {
        return action.payload.map(item => createNewItem(DOM, item))
      }
    })

  const addItemReducer$ = action$
    .filter(a => a.type === ITEM_ADDED)
    .map(action => {
      return function addItemReducer (items) {
        if (action.payload.error) {
          return window.alert(`An error occurred while adding item: ${action.payload.error}`)
        }

        const newItem = createNewItem(DOM, action.payload.newItem)
        return items.concat([newItem])
      }
    })

  const removeItemReducer$ = action$
    .filter(a => a.type === REMOVE_ITEM)
    .map(action => function removeItemReducer (items) {
      return items.filter(item => item.id !== action.payload)
    })

  const sortItemsReducer$ = action$
    .filter(a => a.type === ITEMS_SORTED)
    .map(action => {
      return function sortItemReducer (items) {
        const sortedIds = getItemsIds(action.payload)
        return sortedIds.map(id => items.find(item => item.id === id))
      }
    })

  return xs.merge(initialStateReducer$, addItemReducer$, removeItemReducer$, sortItemsReducer$)
    .fold((listItems, reducer) => reducer(listItems), [])
}

function view (state$, DOM, listId) {
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

export default function List (sources) {
  const proxy = {
    itemRemove$: xs.create(),
    itemDuplicate$: xs.create(),
    openModal$: xs.create()
  }
  const response$ = getResponse(sources)
  const action$ = intent(sources.DOM, response$, proxy)
  const state$ = model(sources.DOM, action$)
  const vtree$ = view(state$, sources.DOM, sources.listId)
  const request = getRequest(action$, sources)
  const itemRemove$ = state$.map(items =>
    xs.merge(...items.map(item => item.Remove))
  ).flatten()
  const itemDuplicate$ = state$.map(items =>
    xs.merge(...items.map(item => item.Duplicate))
  ).flatten()
  const openModal$ = action$.filter(action => action.type === OPEN_MODAL)

  proxy.itemRemove$.imitate(itemRemove$)
  proxy.itemDuplicate$.imitate(itemDuplicate$)
  proxy.openModal$.imitate(openModal$)

  return {
    DOM: vtree$,
    HTTP: request,
    OpenModal: openModal$
  }
}
