# egg-apollo-server

The
[apollo-server-koa](https://github.com/apollographql/apollo-server/tree/master/packages/apollo-server-koa)
plugin in egg.  
在 config/config.\${env}.js 配置 graphql options。支持 apollo-server 中的所有
[options](https://www.apollographql.com/docs/apollo-server/api/apollo-server).

```js
config.graphql = {
	router: "/graphql",

	// 是否加载到 app 上，默认开启
	app: true,
	// 是否加载到 agent 上，默认关闭
	agent: false,
	// 是否加载开发者工具 graphiql, 默认开启。路由同 router 字段。使用浏览器打开该可见。
	graphiql: true
	// graphQL 路由前的拦截器
	// * onPreGraphQL(ctx) {}, 不支持

  // * onPreGraphiQL(ctx) {}, 不支持
  //以下为apollo-server中的options

  uploads: true, //是否开启文件上传功能，默认关闭
};
```

## egg-apollo-server 和 egg-graphql 的区别

1. 除了 onPreGraphQL,onPreGraphiQL 外完全兼容 egg-graphql 配置选项
2. **支持文件上传**.
3. 更漂亮的调试界面
