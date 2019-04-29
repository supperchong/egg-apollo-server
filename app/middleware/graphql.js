'use strict';

// Notice that this path is totally changed, because this function isn't
// directly exposed to the public, now we must still use that for the middle-
// ware.
const { ApolloServer } = require('apollo-server-koa')
const compose = require('koa-compose')
/**
 * @param {Object} options The `options` of apollo-server.
 * @return {Promise} The compose of middleware in apollo-server-koa.
 */

module.exports = (_, app) => {
  const options = {...app.schemaConfig,...app.config.graphql};
  const {graphiql=true,router,...ApolloServerConfig}=options
  const server = new ApolloServer({
    context: options=>options.ctx,
    //不设置request.credentials 会导致请求不带cookie
    playground:graphiql&&{
      settings:{
        "request.credentials": "include"
      }
    },
    ...ApolloServerConfig,
  })
  if(router){
    server.setGraphQLPath(router)
  }
  
  let middlewares = []
  const proxyApp = {
    use: m => {
      middlewares.push(m)
    },
  }
  server.applyMiddleware({
    app: proxyApp,
  })
  return compose(middlewares)
};
