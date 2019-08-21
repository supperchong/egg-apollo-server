'use strict';

/**
 * reference: https://github.com/eggjs/egg-graphql/blob/master/lib/load_schema.js
 */

// const util = require('util');
const path = require('path');
const fs = require('fs');

const utils = require('./utils');
// 由于app.js中不支持async configWillLoad,于是以下只能使用同步函数
// const readdirPromise = util.promisify(fs.readdir);
const readdirSync = fs.readdirSync;
// const statPromise = util.promisify(fs.stat);
const statSync = fs.statSync;
const SYMBOL_SCHEMA = Symbol('Applicaton#schema');
const { graphqlLoader, resolverLoader, directiveLoader, schemaDirectiveLoader, getMatchFile } = utils;
const { makeExecutableSchema } = require('graphql-tools');
module.exports = app => {
  const basePath = path.join(app.baseDir, 'app/graphql');
  const types = readdirSync(basePath);
  const { defaultEmptySchema = true, subscriptions } = app.config.graphql;
  let defaultSchema = `
  type Query 
  type Mutation
  `;
  if (subscriptions) {
    defaultSchema += 'type Subscription';
  }
  const typeDefs = [];
  const resolverMap = {};
  const directiveMap = {};
  const schemaDirectiveMap = {};

  let filePaths = [];
  let fileNames = [];
  if (defaultEmptySchema) {
    typeDefs.push(defaultSchema);
  }
  types.forEach(type => {
    const dir = path.join(basePath, type);
    const stats = statSync(dir);
    if (stats.isDirectory()) {
      const subFileNames = readdirSync(dir);
      const subfilePaths = subFileNames.map(subFileName =>
        path.join(dir, subFileName)
      );
      filePaths = [ ...filePaths, ...subfilePaths ];
      fileNames = [ ...fileNames, ...subFileNames ];
    }
  });


  const loaders = [
    {
      match: 'schema.graphql',
      loader: graphqlLoader,
      obj: typeDefs,
    },
    {
      match: getMatchFile('resolver'),
      loader: resolverLoader,
      obj: resolverMap,
    },
    {
      match: getMatchFile('directive'),
      loader: directiveLoader,
      obj: directiveMap,
    },
    {
      match: getMatchFile('schemaDirective'),
      loader: schemaDirectiveLoader,
      obj: schemaDirectiveMap,
    },
  ];
  fileNames.forEach((fileName, index) => {
    for (const { match, loader, obj } of loaders) {
      if (match === fileName) {
        loader(filePaths[index], obj, app);
        break;
      }
    }
  });
  /**
   * ```js
   * new ApolloServer(options)
   * ```
   * options不支持directiveResolvers,makeExecutableSchema支持directiveResolvers
   * 但是可以用schemaDirectives来替代,而且实现的功能更多
   * @url https://www.apollographql.com/docs/graphql-tools/schema-directives#what-about-directiveresolvers
   */
  app.schemaConfig = {
    typeDefs,
    resolvers: resolverMap,
    // directiveResolvers: directiveMap, //ApolloServer使用schemaDirectives替换
    schemaDirectives: schemaDirectiveMap,
  };
  Object.defineProperty(app, 'schema', {
    // 主要是为了兼容egg-graphql下的service/graphql.js
    get() {
      if (!this[SYMBOL_SCHEMA]) {
        this[SYMBOL_SCHEMA] = makeExecutableSchema({
          typeDefs,
          resolvers: resolverMap,
          directiveResolvers: directiveMap,
          schemaDirectives: schemaDirectiveMap,
        });
      }
      return this[SYMBOL_SCHEMA];
    },
  });
};
