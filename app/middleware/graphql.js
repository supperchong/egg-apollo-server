'use strict';


const { ApolloServer } = require('apollo-server-koa');
const compose = require('koa-compose');
/**
 * @param {Object} options The `options` of apollo-server.
 * @return {Promise} The compose of middleware in apollo-server-koa.
 */

module.exports = (_, app) => {
  let graphqlConfig = app.config.graphql;
  if (typeof graphqlConfig === 'function') {
    graphqlConfig = graphqlConfig(app);
  }
  const options = { ...app.schemaConfig, ...graphqlConfig };
  const { graphiql = true, router, ...ApolloServerConfig } = options;
  if (ApolloServerConfig && ApolloServerConfig.formatError) {
    if (typeof ApolloServerConfig.formatError !== 'function') {
      throw new Error('formatError must be function');
    }
    const formatError = ApolloServerConfig.formatError;
    const appFormatError = error => {
      return formatError(error, app);
    };
    ApolloServerConfig.formatError = appFormatError;
  }
  const server = new ApolloServer({
    context: options => options.ctx,
    // 不设置request.credentials 会导致请求不带cookie
    playground: graphiql && {
      settings: {
        'request.credentials': 'include',
      },
    },
    ...ApolloServerConfig,
  });
  if (ApolloServerConfig.subscriptions) {
    app.once('server', httpServer => {
      // initial subscription
      server.installSubscriptionHandlers(httpServer);
    });
  }

  const middlewares = [];
  const proxyApp = {
    use: m => {
      middlewares.push(m);
    },
  };
  server.applyMiddleware({
    app: proxyApp,
    path: router,
  });
  return compose(middlewares);
};
