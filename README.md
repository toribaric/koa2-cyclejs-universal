# Koa 2 and cycle.js universal sample app

## Included libraries

- [koa 2](https://github.com/koajs/koa)
- [cycle.js](https://cycle.js.org)
- [cyclic router](https://github.com/cyclejs-community/cyclic-router)
- [webpack 2](https://webpack.js.org/), [webpack dev server](https://github.com/webpack/webpack-dev-server),
chunk hashing, css loader with [css modules](https://github.com/css-modules/css-modules) enabled
- [postcss](http://postcss.org/), [cssnext](http://cssnext.io/)
- [standard.js](https://standardjs.com/)
- [flow.js](https://flow.org/) static type checker
  - work in progress, must define flow.js types for cycle/xstream typescript types
  
## Included feature examples
- client-side routing with server-side rendering (both content and state dehydration/rehydration with initial state driver)
- items scene with dynamic item lists and the ability to add, remove, duplicate items with server-side state persistence 
(cyclic dependent streams handling)
- items scene also has examples of immediate rendering while persisting server-side ('optimistic response' - item removing)
and waiting for the server to respond to render (item adding and duplicating)
- modal dialog which wraps the injected component (AddItem from list in this case) - more examples of cyclic
dependent streams handling
- sortable component - makes the items list sortable by additionally updating the emitted list vtree on mouse down, move and
up events before it sinks to the DOM driver - it also emits the 'vnodesSorted' DOM event with the list of sorted vnodes (lists' 
intent in return merges that event into the action$ stream in order to resort it's item components)

## Getting started

1) `$ yarn` - install packages
2) `$ NODE_ENV=development yarn start-dev` - start dev server
3) `$ yarn build` - build server & client
4) `$ yarn start-dev` - start dev server
5) `$ yarn start-prod` - start the app in production mode - must be built
6) `$ yarn flow` - type check with flow.js
7) Open http://localhost:3000/ in your browser.
