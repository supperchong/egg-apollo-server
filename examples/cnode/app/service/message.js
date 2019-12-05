'use strict';
const Service = require('egg').Service;
class Message extends Service {
  async getMessageCount(args) {
    const url = this.config.cnodeBaseUrl + '/message/count';
    const result = await this.ctx.curl(url, {
      dataType: 'json',
      data: {
        ...args,
      },
    });
    const data = result.data.data;

    return data;
  }
  async markMessages(args) {
    const url = this.config.cnodeBaseUrl + '/message/mark_all';
    const result = await this.ctx.curl(url, {
      dataType: 'json',
      method: 'POST',
      data: {
        ...args,
      },
    });
    const marked_msgs = result.data.marked_msgs.map(v => v.id);

    return marked_msgs;
  }
  async markMessage(args) {
    const url = this.config.cnodeBaseUrl + '/message/mark_one/' + args.msg_id;
    const result = await this.ctx.curl(url, {
      dataType: 'json',
      method: 'POST',
      data: {
        accesstoken: args.accesstoken,
      },
    });
    const marked_msg_id = result.data.marked_msg_id;

    return marked_msg_id;
  }
}
module.exports = Message;
