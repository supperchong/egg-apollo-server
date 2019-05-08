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
const { graphqlLoader, resolverLoader, directiveLoader } = utils;
const { makeExecutableSchema } = require('graphql-tools');
module.exports = app => {
  const basePath = path.join(app.baseDir, 'app/graphql');
  const types = readdirSync(basePath);

  const typeDefs = [];
  const resolverMap = {};
  const directiveMap = {};
  let filePaths = [];
  let fileNames = [];

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
      match:
        process.env.EGG_TYPESCRIPT === 'true' && utils.extensions['.ts']
          ? 'resolver.ts'
          : 'resolver.js',
      loader: resolverLoader,
      obj: resolverMap,
    },
    {
      match: 'directive.js',
      loader: directiveLoader,
      obj: directiveMap,
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
  app.schemaConfig = {
    typeDefs,
    resolvers: resolverMap,
    directiveResolvers: directiveMap,
  };
  Object.defineProperty(app, 'schema', {
    // 主要是为了兼容egg-graphql下的service/graphql.js
    get() {
      if (!this[SYMBOL_SCHEMA]) {
        this[SYMBOL_SCHEMA] = makeExecutableSchema({
          typeDefs,
          resolvers: resolverMap,
          directiveResolvers: directiveMap,
          // schemaDirectives: schemaDirectivesProps,
        });
      }
      return this[SYMBOL_SCHEMA];
    },
  });
};
