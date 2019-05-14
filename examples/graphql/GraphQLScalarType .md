# GraphQLScalarType

graphql 指定了五种标量类型 Int,String,Float,Boolean,ID
如果想用到其它类型，比如 Date，就需要自定义了

## 自定义标量类型

1. schema

```graphql
scalar Date

type MyType {
  created: Date
}
```

2. resolver
   GraphQLScalarType 的实例

```js
import { GraphQLScalarType, GraphQLError } from 'graphql';
import { Kind } from 'graphql/language';

const schema = `
scalar Date

type Query {
  created: Date
}
`;
const resolverMap = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value) {
      return new Date(value); // value from the client
    },
    serialize(value) {
      return value.getTime(); // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return new Date(ast.value); // ast value is always in string format
      }
      //如果格式验证不通过,可以return null或者 throw new GraphQLError()
      return null;
    }
  })
};
const jsSchema = makeExecutableSchema({
  typeDefs: schemaString,
  resolvers: resolverMap
});
```

GraphQLScalarType 构造函数有五个选项

- name
  scalar 名字
- description
  简单描述
- serialize
  接受来自字段 resolver 之后的值，然后处理返回给客户端

resolver -> serialize -> client;

```js
const schema = `
scalar Date

type Query {
  created: Date
}
`;
const resolverMap = {
  Query: {
    created: () => {
      return new Date();
    }
  },
  Date: new GraphQLScalarType({
    serialize(value) {
      //value的值为上面的new Date()
      return value.getTime();
    }
  })
};
```

- parseValue

```js
parseValue = value => any;
```

- parseLiteral

```js
parseValue = ast => any;
```

### parseValue 和 parseLiteral

parseValue 和 parseLiteral 都用来读取来自客户端传递来的值，不同之处在于
当客户端不使用变量时，传递过来的值是字符串,会使用 parseLiteral 解析
使用变量时,传递过来的值会使用 parseValue 解析  
解析之后的值会传递给字段的 resolver 函数

client -> parseLiteral ->resolver ;
例如

```graphql
#服务器
scalar Date
type Mutation {
  setTime(time: Date!): Boolean
}
```

```graphql
#客户端
mutation {
  setTime(time: 1557814555937)
}
```

此时会调用 `parseLiteral`  
ast.kind 表示值的类型,ast.value 为"1557814555937"

如果客户端用变量传递

```graphql
#客户端
mutation ($time:Date!){
  setTime(time: $time)
}
variables={
  time:1557814555937
}
```

此时会调用 `parseValue`  
value 的值为 1557814555937

由于 variables 是 json 格式，所以 value 的值可以是字符串,数字,布尔,null,数组,对象
而 parseLiteral 传递的 ast.value 只能是字符串

当客户端传递过来的值不符合格式时,可以在 parseValue 和 parseLiteral 返回 null
也可以 throw new GraphQLError()

### example

```js
const { ApolloServer, gql } = require('apollo-server');
const { GraphQLScalarType } = require('graphql');
const typeDefs = gql`
  scalar Date
  type Query {
    dummy: String
  }
  type Mutation {
    setTime(time: Date!): Boolean
  }
`;
const resolvers = {
  Date: new GraphQLScalarType({
    name: 'Date',
    serialize: v => v,
    parseValue: v => {
      console.log('parseValue:', typeof v, v);
      return v;
    },
    parseLiteral(ast) {
      console.log('value:', typeof v.value, v.value);
      return ast.value;
    }
  }),
  Mutation: {
    setTime: (root, params) => {
      console.log(params.time);
      return true;
    }
  }
};
const server = new ApolloServer({
  typeDefs,
  resolvers
});

// This `listen` method launches a web-server.  Existing apps
// can utilize middleware options, which we'll discuss later.
server.listen(3000).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
```
