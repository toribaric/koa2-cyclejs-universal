import xs from 'xstream'
import isolate from '@cycle/isolate'
import Item from '../item'
import { getItemsIds } from './utils'
import {
  INITIAL_STATE
} from '../../drivers/initialState'
import {
  ITEM_ADDED,
  REMOVE_ITEM,
  ITEMS_SORTED
} from '../../constants'

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

export default function model (DOM, action$) {
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
