'use strict';
const Service = require('egg').Service;
class Topic extends Service {
  async getTopics(args) {
    const url = this.config.cnodeBaseUrl + '/topics';
    const result = await this.ctx.curl(url, {
      dataType: 'json',
      data: {
        ...args,
      },
    });
    const data = result.data.data;

    return data;
  }
  async getTopic(args) {
    const { id } = args;
    const url = this.config.cnodeBaseUrl + '/topic/' + id;
    const result = await this.ctx.curl(url, {
      dataType: 'json',
      data: {
        ...args,
      },
    });
    const data = result.data.data;

    return data;
  }
}
module.exports = Topic;
