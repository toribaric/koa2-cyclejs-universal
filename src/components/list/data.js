import xs from 'xstream'
import { getItemsIds } from './utils'
import {
  getRequestWithState,
  getResponseWithState
} from '../../drivers/initialState'
import {
  ADD_ITEM,
  ITEM_ADDED,
  REMOVE_ITEM,
  DUPLICATE_ITEM,
  ITEMS_SORTED,
  BASE_PATH,
  ADD_ITEM_PATH,
  SORT_ITEMS_PATH,
  DELETE_ITEM_PATH,
  DUPLICATE_ITEM_PATH
} from '../../constants'

export function getRequest (action$, { initialState, url, category, listId }) {
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

export function getResponse ({ HTTP, initialState, category }) {
  return xs.merge(
    getResponseWithState(initialState, HTTP, category),
    xs.merge(HTTP.select('add-item'), HTTP.select('duplicate-item'))
      .flatten()
      .map(res => ({ type: ITEM_ADDED, payload: JSON.parse(res.text) }))
  )
}
