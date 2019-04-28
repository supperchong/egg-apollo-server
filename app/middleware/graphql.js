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
  const graphQLRouter = options.router;
  let graphiql = true;

  if (options.graphiql === false) {
    graphiql = false;
  }

  const server = new ApolloServer({
    ...options,
    context: function(options){
      return options.ctx
    },
    playground:graphiql,
    
  })
  if(graphQLRouter){
    server.setGraphQLPath(graphQLRouter)
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
