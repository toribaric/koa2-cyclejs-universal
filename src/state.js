import { getLists, getListItems } from './utils'

const APP_STATE = {
  '/items': () => {
    return getLists().map(list => ({
      ...list,
      items: getListItems(list.id)
    }))
  }
}

export default function getInitialState (path, ...params) {
  if (!APP_STATE[path]) {
    return null
  }

  return APP_STATE[path](...params)
}
