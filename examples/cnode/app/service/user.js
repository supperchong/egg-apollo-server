'use strict';
const Service = require('egg').Service;
class User extends Service {
  async getUser(args) {
    const url = this.config.cnodeBaseUrl + '/user/' + args.loginname;
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
module.exports = User;
