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

## Getting started

1) `$ yarn` - install packages
2) `$ NODE_ENV=development yarn start-dev` - start dev server
3) `$ yarn build` - build server & client
4) `$ yarn start-dev` - start dev server
5) `$ yarn start-prod` - start the app in production mode - must be built
6) `$ yarn flow` - type check with flow.js
7) Open http://localhost:3000/ in your browser.
