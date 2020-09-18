import { Controller } from 'egg';

export default class extends Controller {
  public async callback() {
    const { ctx } = this;

    // 回调校验
    if (ctx.method === 'GET') {
      const verifyResult = await ctx.service.wechat.adapter.callbackVerify();
      ctx.body = verifyResult ? verifyResult.message : '';
      return;
    }

    // 接收消息
    try {
      const message = await ctx.service.wechat.adapter.decodeMsg();
      ctx.logger.info('Get message from wechat', message);

      // 当用户消息类型为图片、语音、视频类型时，微信回调一个 mediaId
      if (message.mediaId) {
        // 获取媒体文件流
        const buffer = await ctx.service.wechat.media.getMedia(message.mediaId);
        // 对媒体文件流做一些处理，例如转存到本地
        console.log(buffer.data);
      }

      // 正常情况下，服务端需要先将媒体文件通过 ctx.service.wechat.media.uploadMedia 方法上传至微信服务器获取 mediaId
      // eg: 将用户原始消息直接回复
      // if (message.msgType === 'text') {
      //   ctx.body = await ctx.service.wechat.adapter.encodeMsg({
      //     type: 'text',
      //     content: message.content
      //   });
      // } else {
      //   ctx.body = await ctx.service.wechat.adapter.encodeMsg({
      //     type: message.msgType,
      //     content: {
      //       mediaId: message.mediaId
      //     }
      //   });
      // }

      // eg: 图文消息回复
      // ctx.body = await ctx.service.wechat.adapter.encodeMsg({
      //   type: 'news',
      //   content: [
      //     {
      //       title: '标题',
      //       description: '描述',
      //       url: 'https://www.baidu.com'
      //     }
      //   ]
      // });

      // eg: 使用客服消息接口主动发送消息
      // 先给微信服务器一个响应
      ctx.body = await ctx.service.wechat.adapter.encodeMsg('');
      ctx.service.wechat.message.typing(message, true);
      // 模拟一段时间的处理后，给用户主动推送消息
      setTimeout(() => {
        ctx.service.wechat.message.typing(message, false);
        ctx.service.wechat.message.sendTextMsg({
          ...message,
          content: '哈喽，这是五秒后的回复'
        });
      }, 5000);
    } catch (error) {
      ctx.logger.error(error);
      // 给微信空值响应，避免公众号出现报错
      ctx.body = '';
    }
  }
}
