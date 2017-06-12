import xs from 'xstream'
import {
  getRequestWithState,
  getResponseWithState
} from '../../drivers/initialState'
import {
  BASE_PATH,
  LISTS_PATH,
  ADD_LIST_PATH,
  DELETE_LIST_PATH,
  ADD_LIST,
  LIST_ADDED,
  REMOVE_LIST
} from '../../constants'

export function getRequest (action$, state$, category) {
  const initial$ = getRequestWithState(state$, `${BASE_PATH}${LISTS_PATH}`, category)
  const mutation$ = action$.map(action => {
    if (action.type === ADD_LIST && action.payload) {
      return {
        url: `${BASE_PATH}${ADD_LIST_PATH}`,
        method: 'POST',
        send: { title: action.payload },
        category: 'add-list'
      }
    }

    if (action.type === REMOVE_LIST && action.payload) {
      return {
        url: `${BASE_PATH}${DELETE_LIST_PATH}`
          .replace(':listId', action.payload),
        method: 'DELETE',
        category: 'delete-list'
      }
    }

    return {}
  })

  return xs.merge(initial$, mutation$)
}

export function getResponse (InitialState, HTTP, category) {
  return xs.merge(
    getResponseWithState(InitialState, HTTP, category),
    HTTP.select('add-list')
      .flatten()
      .map(res => ({ type: LIST_ADDED, payload: JSON.parse(res.text) }))
  )
}
