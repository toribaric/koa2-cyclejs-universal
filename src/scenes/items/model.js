import xs from 'xstream'
import isolate from '@cycle/isolate'
import {
  INITIAL_STATE
} from '../../drivers/initialState'
import List from '../../components/list'
import {
  BASE_PATH,
  ITEMS_PATH,
  LIST_ADDED,
  REMOVE_LIST
} from '../../constants'

function getListParams (sources, list) {
  const params = {
    ...sources,
    listId: list.id,
    listTitle: list.title,
    url: `${BASE_PATH}${ITEMS_PATH}`.replace(':listId', list.id),
    category: 'listItems'
  }

  if (list.items) {
    return { ...params, initialState: list.items }
  }

  return params
}

function createNewList (params) {
  const list = isolate(List)(params, `list${params.listId}`)
  return {
    ...list,
    id: params.listId,
    Remove: list.Remove.mapTo(params.listId)
  }
}

export default function model (sources, action$) {
  const initialStateReducer$ = action$
    .filter(a => a.type === INITIAL_STATE)
    .map(action => {
      return function initialStateReducer () {
        return action.payload.map(list => {
          const params = getListParams(sources, list)
          return createNewList(params)
        })
      }
    })

  const addListReducer$ = action$
    .filter(a => a.type === LIST_ADDED)
    .map(action => {
      return function addListReducer (lists) {
        if (action.payload.error) {
          return window.alert(`An error occurred while adding list: ${action.payload.error}`)
        }

        const params = getListParams(sources, action.payload.newList)
        const newList = createNewList(params)
        return lists.concat([newList])
      }
    })

  const removeListReducer$ = action$
    .filter(a => a.type === REMOVE_LIST)
    .map(action => function removeListReducer (lists) {
      return lists.filter(list => list.id !== action.payload)
    })

  return xs.merge(initialStateReducer$, addListReducer$, removeListReducer$)
    .fold((lists, reducer) => reducer(lists), [])
}
