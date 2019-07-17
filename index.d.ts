
import 'apollo-server-koa'
import { Config } from 'apollo-server-koa';
export interface EggGraphqlConfig{
    /**
     * graphql请求的路由
     * @default '/graphql' 
     */
    router: string;
    /**
     * 是否加载到 app 上
     * @default true
     */
    app: boolean;
    /**
     * 是否加载到 agent 上
     * @default false
     */
    agent: boolean;
    /**
     * 是否加载开发者工具
     * @default true
     */
    graphiql: boolean;
}
declare module 'egg' {
    interface EggAppConfig  {
        graphql:Config|EggGraphqlConfig
    }
}