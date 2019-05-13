'use strict';
const BuiltinModule = require('module');
const fs = require('fs');
// const util = require('util');
// const readFilePromise = util.promisify(fs.readFile);
const readFileSync = fs.readFileSync;
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
  getMatchFile: name => {
    const isTs = process.env.EGG_TYPESCRIPT === 'true' && module.exports.extensions['.ts'];
    const suffix = isTs ? 'ts' : 'js';
    return name + '.' + suffix;
  },
  graphqlLoader: (filePath, obj) => {
    obj.push(readFileSync(filePath, { encoding: 'utf8' }));
  },
  resolverLoader: (filePath, obj, app) => {
    let resolver = require(filePath);
    if (_.isFunction(resolver)) {
      resolver = resolver(app);
      _.merge(obj, resolver);
    } else if (_.isObject(resolver)) {
      _.merge(obj, resolver);
    }
  },
  directiveLoader: (filePath, obj) => {
    _.merge(obj, require(filePath));
  },
  schemaDirectiveLoader: (filePath, obj) => {
    _.merge(obj, require(filePath));
  },
};
