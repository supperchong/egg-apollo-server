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
    uploads: true, // 是否开启文件上传功能，默认开启
    defaultEmptySchema: true,
    // 可选字段,接受项目中发生的错误,然后自定义错误返回给前端
    formatError: error => {
      console.log(error);
      return error;
    },
    debug: false, // 发生错误时,是否包含错误堆栈信息,生产环境要设置为false
  };
  config.security = {
    csrf: false,
  };
  // change to your own sequelize configurations
  // config.sequelize = dbConfig.development;

  return config;
};
