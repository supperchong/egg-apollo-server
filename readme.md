# egg-apollo-server

[![NPM version][npm-image]][npm-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-apollo-server.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-apollo-server
[codecov-image]: https://codecov.io/gh/supperchong/egg-apollo-server/branch/master/graphs/badge.svg
[codecov-url]: https://codecov.io/gh/supperchong/egg-apollo-server
[download-image]: https://img.shields.io/npm/dm/egg-apollo-server.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-apollo-server

## The [apollo-server-koa](https://github.com/apollographql/apollo-server/tree/master/packages/apollo-server-koa) plugin in egg.

## Getting Started

### install

With yarn:

```sh
yarn add egg-apollo-server
```

or using npm

```sh
npm install --save egg-apollo-server
```

### Usage

1. 开启插件

```js
// config/plugin.js
exports.graphql = {
  enable: true,
  package: 'egg-apollo-server'
};
```

2. 在 config/config.\${env}.js 配置 graphql options。支持 apollo-server 中的所有
   [options](https://www.apollographql.com/docs/apollo-server/api/apollo-server).

```js
config.graphql = {
  router: '/graphql',
  app: true, //是否加载到 app 上,默认为 true
  agent: false, //是否加载到 agent 上,默认为 false
  graphiql: true, //是否加载开发者工具 playground,默认为 true
  uploads: true, //是否开启文件上传功能，默认开启

  //是否添加默认的type Query,Mutation,默认为true
  //如果为true须使用extend type Query|extend type Mutation,因为graphql规定同一个type只能定义一个
  //带来的好处时egg/graphql下不用再新建query,mutation目录
  defaultEmptySchema: true,

  //subscriptions的值为<Object>|<String>|false 见https://www.apollographql.com/docs/apollo-server/api/apollo-server/
  //如果为String 表示订阅的路径
  //如果为false 关闭订阅
  //如果为object 可以添加path,keepAlive,onConnect,onDisconnect
  subscriptions: {
    onConnect: (connectionParams, webSocket) => {
      console.log('connect');
      if (connectionParams.authToken) {
        // return validateToken(connectionParams.authToken)
        //   .then(findUser(connectionParams.authToken))
        //   .then(user => {
        //     return {
        //       currentUser: user,
        //     }
        //   })
      }

      // throw new Error('Missing auth token!')
    }
  },
  //可选字段,接受项目中发生的错误,然后自定义错误返回给前端
  formatError: (error, app) => {
    // console.log(error);
    app.logger.error(error);
    return error;
  },
  debug: false // 发生错误时,是否包含错误堆栈信息,生产环境要设置为false
};

// 添加中间件拦截请求
exports.middleware = ['graphql'];
```

3. 项目目录

在 app 目录下新建 graphql 目录, graphql 相关文件写在此目录,插件会读取
app/graphql 下**所有目录**里面的 graphql 相关文件

```
├── app
│   ├── controller
│   │   └── home.js
│   ├── graphql
│   │   ├── tag
│   │   │   ├── resolver.js
│   │   │   └── schema.graphql
│   │   └── user
│   │       ├── resolver.js
│   │       └── schema.graphql
│   ├── router.js
│   └── service
├── config
│   ├── config.default.js
│   └── plugin.js
├── package.json
└── package-lock.json
```

graphql 相关文件包含:

- schema.graphql  
  a GraphQL type language string

```graphql
#插件设置了默认的Query,Mutation 所以不用定义Query,直接使用extend继承
extend type Query {
  users: [User]
  user(id: ID!): User
}
type User {
  id: ID!
  name: String
  age: Int
}

extend type Mutation {
  addUser(input: AddUser): User
  updateUser(input: UpdateUser): User
  deleteUser(id: ID!): Boolean
}
input AddUser {
  name: String
  age: Int
}
input UpdateUser {
  id: ID!
  name: String
  age: Int
}
```

- resolver.js  
  a nested object that maps type and field names to resolver functions

```js
module.exports = {
  Query: {
    users: () => {
      return users;
    },
    user: (root, params) => {
      const { id } = params;
      return users.find(user => user.id == id);
    }
  }
};
```

- schemaDirective.js  
  a nested object that maps type and field names to resolver functions

```js
const { defaultFieldResolver } = require('graphql');
const { SchemaDirectiveVisitor } = require('graphql-tools');
class UpperDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async (...args) => {
      const defaultText = await resolve.apply(this, args);
      if (typeof defaultText === 'string') {
        return defaultText.toUpperCase();
      }
      return defaultText;
    };
  }
}
module.exports = {
  upper: UpperDirective
};
```

#### demo

[egg 中使用 graphql](https://github.com/supperchong/egg-apollo-server/tree/master/examples/simple)

#### **options**

- router <String> - 处理 graphql 请求的路由,默认为 "/graphql"
- app <Boolean> - 是否加载到 app 上,默认为 true
- agent <Boolean> - 是否加载到 agent 上,默认为 false
- graphiql <Boolean> - 是否加载开发者工具 playground,默认为 true
- uploads <Boolean> - 是否开启文件上传功能,默认为 true

其它 options 参
见[apollo-server](https://www.apollographql.com/docs/apollo-server/api/apollo-server)

## egg-apollo-server 和 egg-graphql 的区别

<!-- 1. 除了 onPreGraphQL,onPreGraphiQL, 外完全兼容 egg-graphql 配置选项 -->

1. 不支持 onPreGraphQL,onPreGraphiQL
2. [不支持 directiveResolvers,用 schemaDirective 替代](https://www.apollographql.com/docs/graphql-tools/schema-directives#what-about-directiveresolvers)
3. **支持文件上传**.
4. **更漂亮的调试界面**.
5. 支持自定义错误类型
6. 支持 dataSources
7. 支持缓存(redis 等)
8. 支持 Subscriptions
9. 支持 mock
10. 支持默认的 Query

## 设置默认 Query 的好处？

未设置默认 Query 之前,假如有 user,tag 两个表，需要建四个文件夹,这样导致 mutation,query 包含了所有的一级查询,增加,更新,删除
而 user 相关定义又在 user/graphql 下

```
app
└── graphql
    ├── mutation
    │   └── schema.graphql
    ├── query
    │   └── schema.graphql
    ├── tag
    │   ├── resolver.js
    │   └── schema.graphql
    └── user
        ├── resolver.js
        └── schema.graphql
```

有了默认 Query 后,只需要建两个文件夹

```
app
└── graphql
    ├── tag
    │   ├── resolver.js
    │   └── schema.graphql
    └── user
        ├── resolver.js
        └── schema.graphql
```

只需要在各自 schema.graphql 定义
例如
[egg 中使用 graphql](/examples/graphql)

```graphql
#app/graphql/user/schema.graphql
extend type Query {
  user(id: ID!): User
}
extend type Mutation {
  addUser(input: AddUser): User
}
input AddUser {
  name: String
  age: Int
}
type User {
  id: ID!
  name: String
  age: Int
}
```

## TODO

- 支持自定义 schema,可自定义 graphql 相关文件结构
- 支持 typeDefs 里引用 model 数据
