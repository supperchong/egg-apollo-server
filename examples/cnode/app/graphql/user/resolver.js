'use strict';
module.exports = {
  Query: {
    user: (root, args, ctx) => {
      return ctx.service.user.getUser(args);
    },
  },
};
