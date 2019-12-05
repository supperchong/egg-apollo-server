'use strict';
module.exports = {
  Query: {
    topics: (root, args, ctx) => {
      return ctx.service.topic.getTopics(args);
    },
    topic: (root, args, ctx) => {
      return ctx.service.topic.getTopic(args);
    },
  },
};
