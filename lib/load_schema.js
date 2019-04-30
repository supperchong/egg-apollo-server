'use strict';

/**
 * copy from https://github.com/eggjs/egg-graphql/blob/master/lib/load_schema.js
 */
const fs = require('fs');
const path = require('path');
const {
  makeExecutableSchema,
} = require('graphql-tools');
const _ = require('lodash');

const SYMBOL_SCHEMA = Symbol('Applicaton#schema');

module.exports = app => {
  const basePath = path.join(app.baseDir, 'app/graphql');
  const types = fs.readdirSync(basePath);

  const typeDefs = [];
  const resolverMap = {};
  const resolverFactories = [];
  const directiveMap = {};

  types.forEach(type => {
    // 加载typeDefs
    const typeDefFile = path.join(basePath, type, 'schema.graphql');
    /* istanbul ignore else */
    if (fs.existsSync(typeDefFile)) {
      const typeDef = fs.readFileSync(typeDefFile, {
        encoding: 'utf8',
      });
      typeDefs.push(typeDef);
    }

    // 加载resolver
    const resolverFile = path.join(basePath, type, 'resolver.js');
    if (fs.existsSync(resolverFile)) {
      const resolver = require(resolverFile);
      if (_.isFunction(resolver)) {
        resolverFactories.push(resolver);
      } else if (_.isObject(resolver)) {
        _.merge(resolverMap, resolver);
      }
    }

    // 加载directive resolver
    const directiveFile = path.join(basePath, type, 'directive.js');
    if (fs.existsSync(directiveFile)) {
      const directive = require(directiveFile);
      _.merge(directiveMap, directive);
    }
  });
  resolverFactories.forEach(resolverFactory => _.merge(resolverMap, resolverFactory(app)));
  app.schemaConfig={
    typeDefs:typeDefs,
    resolvers:resolverMap,
    directiveResolvers:directiveMap
  }
  Object.defineProperty(app,'schema',{
    //主要是为了兼容egg-graphql下的service/graphql.js
    get(){
      if (!this[SYMBOL_SCHEMA]) {
        resolverFactories.forEach(resolverFactory => _.merge(resolverMap, resolverFactory(app)));

        this[SYMBOL_SCHEMA] = makeExecutableSchema({
          typeDefs: schemas,
          resolvers: resolverMap,
          directiveResolvers: directiveMap,
          schemaDirectives: schemaDirectivesProps,
        });
      }
      return this[SYMBOL_SCHEMA];
    },
    
  })
};
