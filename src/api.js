/* @flow */

import Router from 'koa-router'
import { getLists, getListItems } from './utils'

export default function setupApiRoutes (router: Router) {
  router.get('/api/v1/lists', (ctx: Object, next: () => void): void => {
    ctx.body = getLists()
  })
  router.get('/api/v1/list/:listId/items', (ctx: Object, next: () => void): void => {
    ctx.body = getListItems(parseInt(ctx.params.listId))
  })
  router.get('/api/v1/item/:id', (ctx: Object, next: () => void): void => {

  })
}
