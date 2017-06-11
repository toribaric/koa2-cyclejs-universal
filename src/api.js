/* @flow */

import Router from 'koa-router'
import {
  getLists,
  getListItems,
  addItem,
  sortItems,
  deleteItem,
  duplicateItem
} from './utils'
import {
  LISTS_PATH,
  ITEMS_PATH,
  ADD_ITEM_PATH,
  SORT_ITEMS_PATH,
  DELETE_ITEM_PATH,
  DUPLICATE_ITEM_PATH
} from './constants'

export default function setupApiRoutes (router: Router) {
  router.get(LISTS_PATH, (ctx: Object, next: () => void): void => {
    ctx.body = getLists()
  })
  router.get(ITEMS_PATH, (ctx: Object, next: () => void): void => {
    ctx.body = getListItems(parseInt(ctx.params.listId))
  })
  router.post(ADD_ITEM_PATH, (ctx: Object, next: () => void): void => {
    ctx.body = addItem(parseInt(ctx.params.listId), ctx.request.body)
  })
  router.post(SORT_ITEMS_PATH, (ctx: Object, next: () => void): void => {
    ctx.body = sortItems(parseInt(ctx.params.listId), ctx.request.body)
  })
  router.delete(DELETE_ITEM_PATH, (ctx: Object, next: () => void): void => {
    ctx.body = deleteItem(parseInt(ctx.params.listId), parseInt(ctx.params.id))
  })
  router.post(DUPLICATE_ITEM_PATH, (ctx: Object, next: () => void): void => {
    ctx.body = duplicateItem(parseInt(ctx.params.listId), parseInt(ctx.params.id))
  })
}
