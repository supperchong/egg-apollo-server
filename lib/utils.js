'use strict';
const BuiltinModule = require('module');
const fs = require('fs');
const util = require('util');
const readFilePromise = util.promisify(fs.readFile);
const _ = require('lodash');
// from url:https://github.com/eggjs/egg-core.git
// Guard against poorly mocked module constructors.
const Module =
  module.constructor.length > 1
    ? module.constructor
    : /* istanbul ignore next */
    BuiltinModule;
module.exports = {
  extensions: Module._extensions,
  graphqlLoader: async (filePath, obj) =>
    obj.push(await readFilePromise(filePath, { encoding: 'utf8' })),
  resolverLoader: async (filePath, obj, app) => {
    let resolver = require(filePath);
    if (_.isFunction(resolver)) {
      resolver = await resolver(app);
      _.merge(obj, resolver);
    } else if (_.isObject(resolver)) {
      _.merge(obj, resolver);
    }
  },
  directiveLoader: (filePath, obj) => {
    _.merge(obj, require(filePath));
  },
};
