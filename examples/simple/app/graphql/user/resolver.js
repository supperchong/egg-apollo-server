'use strict';
const users = [
  {
    id: 1,
    name: '小王',
    age: 21,
  },
  {
    id: 2,
    name: '小李',
    age: 22,
  },
  {
    id: 3,
    name: '小白',
    age: 24,
  },
];
module.exports = {
  Query: {
    users: () => {
      return users;
    },
    user: (root, params) => {
      const { id } = params;
      // eslint-disable-next-line eqeqeq
      return users.find(user => user.id == id);
    },
  },
};
