/* @flow */

import Router from 'koa-router'
import { getLists, getListItems, addItem, deleteItem, duplicateItem } from './utils'

export default function setupApiRoutes (router: Router) {
  router.get('/lists', (ctx: Object, next: () => void): void => {
    ctx.body = getLists()
  })
  router.get('/lists/:listId/items', (ctx: Object, next: () => void): void => {
    ctx.body = getListItems(parseInt(ctx.params.listId))
  })
  router.post('/lists/:listId/items/add', (ctx: Object, next: () => void): void => {
    ctx.body = addItem(parseInt(ctx.params.listId), ctx.request.body)
  })
  router.delete('/lists/:listId/items/:id/delete', (ctx: Object, next: () => void): void => {
    ctx.body = deleteItem(parseInt(ctx.params.listId), parseInt(ctx.params.id))
  })
  router.post('/lists/:listId/items/:id/duplicate', (ctx: Object, next: () => void): void => {
    ctx.body = duplicateItem(parseInt(ctx.params.listId), parseInt(ctx.params.id))
  })
}
