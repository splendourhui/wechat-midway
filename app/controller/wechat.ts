import { Controller } from 'egg';

export default class extends Controller {
  public async callback() {
    const { ctx } = this;

    const config = ctx.app.config.wechat;
    ctx.mySession.wechatConfig = config;

    // 回调校验
    if (ctx.method === 'GET') {
      const verifyResult = await ctx.service.wechat.callbackVerify();
      ctx.body = verifyResult ? verifyResult.message : '';
      return;
    }

    // 接收消息
    try {
      const message = await ctx.service.wechat.decodeMsg();
      ctx.logger.info('Get message from wechat', message);

      // eg: 纯文本消息回复
      // ctx.body = await ctx.service.wechat.encodeMsg('收到消息了');

      // eg: 图文消息回复
      ctx.body = await ctx.service.wechat.encodeMsg({
        type: 'news',
        content: [
          {
            title: '标题',
            description: '描述',
            url: 'https://www.baidu.com'
          }
        ]
      });
    } catch (error) {
      ctx.logger.error(error);
      // 给微信空值响应，避免公众号出现报错
      ctx.body = '';
    }
  }
}
