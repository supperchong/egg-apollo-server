'use strict';
const {
  defaultFieldResolver,
} = require('graphql');
const { SchemaDirectiveVisitor } = require('graphql-tools');
class UpperDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async (...args) => {
      const defaultText = await resolve.apply(this, args);
      console.log('default', defaultText);
      if (typeof defaultText === 'string') {
        return defaultText.toUpperCase();
      }
      return defaultText;
    };
  }
}
module.exports = {
  upper: UpperDirective,
};
