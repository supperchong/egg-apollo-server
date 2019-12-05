'use strict';
module.exports = {
  Query: {
    messageCount: (root, args, ctx) => {
      return ctx.service.message.getMessageCount(args);
    },
  },
  Mutation: {
    markMessages: (root, args, ctx) => {
      return ctx.service.message.markMessages(args);
    },
    markMessage: (root, args, ctx) => {
      return ctx.service.message.markMessage(args);
    },
  },
};
