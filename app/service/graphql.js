'use strict';

const { createTestClient } = require('apollo-server-testing');
const GraphqlServer = Symbol.for('Egg#graphqlServer');
async function operate({ request, method }) {
  let result = {};
  const graphqlServer = this.app[GraphqlServer];
  const operation = createTestClient(graphqlServer)[method];
  try {
    if (typeof request === 'string') {
      request = JSON.parse(request);
    }
    result = await operation(request);
  } catch (e) {
    this.logger.error(e);

    result = {
      data: {},
      errors: [ e ],
    };
  }

  return result;
}
module.exports = app => {
  class GraphqlService extends app.Service {
    async query(request) {
      return operate.call(this, {
        request,
        method: 'query',
      });
    }
    async mutate(request) {
      return operate.call(this, {
        request,
        method: 'mutate',
      });
    }
  }
  return GraphqlService;
};
