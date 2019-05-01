# egg-apollo-server

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
在 config/config.\${env}.js 配置 graphql options。支持 apollo-server 中的所有
[options](https://www.apollographql.com/docs/apollo-server/api/apollo-server).

## config.graphql

- options | app=>options

### 示例

```js
config.graphql = {
  router: "/graphql",
  app: true,
  agent: false,
  graphiql: true
  uploads: true, //是否开启文件上传功能，默认关闭
  //可选字段,接受项目中发生的错误,然后自定义错误返回给前端，可以用来过滤错误的堆栈信息
  formatError:error=>{
    console.log(error)
    return {
      message:error.message
    }
  }
};
//如果为函数，则可以接受app为参数，返回options
config.graphql =app=>{
  return {
    router: "/graphql",
    typeDefs,
    resolvers,
    app: true,
    agent: false,
    graphiql: true
    uploads: true, //是否开启文件上传功能，默认关闭
  }
}


```

## **options**

- router <String> - 处理 graphql 请求的路由,默认为 "/graphql"
- app <Boolean> - 是否加载到 app 上,默认为 true
- agent <Boolean> - 是否加载到 agent 上,默认为 false
- graphiql <Boolean> - 是否加载开发者工具 graphiql,默认为 true
- uploads <Boolean> - 是否开启文件上传功能,默认为 false

其它 options 参
见[apollo-server](https://www.apollographql.com/docs/apollo-server/api/apollo-serve)

## egg-apollo-server 和 egg-graphql 的区别

1. 除了 onPreGraphQL,onPreGraphiQL 外完全兼容 egg-graphql 配置选项
2. **支持文件上传**.
3. **更漂亮的调试界面**.

## TODO

- add test
- 支持自定义 schema,可自定义 graphql 相关文件结构
- 支持typeDefs里引用model数据
