'use strict';
module.exports = appInfo => {
  const config = (exports = {});

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_{{keys}}';

  // add your config here
  config.middleware = [ 'graphql' ];
  config.graphql = {
    router: '/graphql',
    app: true,
    agent: false,
    graphiql: true,
    uploads: true, // 是否开启文件上传功能，默认关闭
    // 可选字段,接受项目中发生的错误,然后自定义错误返回给前端，可以用来过滤错误的堆栈信息
    formatError: error => {
      console.log(error);
      return {
        message: error.message,
      };
    },
  };
  config.security = {
    // csrf: {
    //   ignoreJSON: true, // 默认为 false，当设置为 true 时，将会放过所有 content-type 为 `application/json` 的请求
    // },
    // csrf: false,
    methodnoallow: {
      enable: false,
    },
  };
  // change to your own sequelize configurations
  // config.sequelize = dbConfig.development;

  return config;
};
