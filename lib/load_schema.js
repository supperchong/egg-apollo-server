'use strict';

/**
 * reference: https://github.com/eggjs/egg-graphql/blob/master/lib/load_schema.js
 */

const util = require('util');
const path = require('path');
const fs = require('fs');

const utils = require('./utils');
const readdirPromise = util.promisify(fs.readdir);

const statPromise = util.promisify(fs.stat);
const SYMBOL_SCHEMA = Symbol('Applicaton#schema');
const { graphqlLoader, resolverLoader, directiveLoader } = utils;
const { makeExecutableSchema } = require('graphql-tools');
module.exports = async app => {
  const basePath = path.join(app.baseDir, 'app/graphql');
  const types = await readdirPromise(basePath);

  const typeDefs = [];
  const resolverMap = {};
  const directiveMap = {};
  let filePaths = [];
  let fileNames = [];
  await Promise.all(
    types.map(async type => {
      const dir = path.join(app.baseDir, type);
      const stats = await statPromise(dir);
      if (stats.isDirectory()) {
        const subFileNames = await readdirPromise(dir);
        const subfilePaths = subFileNames.map(subFileName =>
          path.join(dir, subFileName)
        );
        filePaths = [ ...filePaths, ...subfilePaths ];
        fileNames = [ ...fileNames, ...subFileNames ];
      }
    })
  );

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
  fileNames.map(async (fileName, index) => {
    for (const { match, loader, obj } of loaders) {
      if (match === fileName) {
        await loader(filePaths[index], obj, app);
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
