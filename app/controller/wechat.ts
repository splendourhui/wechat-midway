import { Controller } from 'egg';
import * as uuid from 'uuid';

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

  public async oauth() {
    const { ctx } = this;
    const redirect = ctx.query.redirect;
    const type = ctx.query.type;
    const decodedUrl = decodeURIComponent(redirect);

    const state = uuid.v4();
    try {
      // 将重定向地址存储起来
      await ctx.service.utils.cache.set(
        state,
        JSON.stringify({
          url: decodedUrl
        }),
        100
      );
      // 构造微信 oauth 地址
      const authorizeURL = await ctx.service.wechat.util.getAuthorizeURL(
        `${ctx.app.config.host}/wechat/oauth_init`,
        state,
        Number(type) === 1 ? 'snsapi_userinfo' : 'snsapi_base'
      );
      ctx.redirect(authorizeURL);
    } catch (error) {
      ctx.logger.error(error);
      ctx.body = '请重试或联系管理员';
    }
  }

  public async oauthInit() {
    const { ctx } = this;
    const code = ctx.query.code;
    const state = ctx.query.state;

    try {
      const redisData = (await ctx.service.utils.cache.get(state)) || '';
      const stateData = JSON.parse(redisData);
      const next = stateData.url;
      // 带上 code 重定向到业务
      ctx.redirect(`${next}${next.indexOf('?') > 0 ? '&' : '?'}code=${code}`);
    } catch (error) {
      ctx.logger.error(error);
      ctx.body = '请重试或联系管理员';
    }
  }

  public async oauthGetUser() {
    const { ctx } = this;
    const code = ctx.query.code;

    try {
      const user = await ctx.service.wechat.util.getUserToken(code);
      if (user.scope === 'snsapi_userinfo') {
        // 非静默授权时，获取用户详细数据
        const result = await ctx.service.wechat.util.getUserInfo(
          user.openid,
          user.access_token
        );
        ctx.body = result;
      } else {
        ctx.body = user;
      }
    } catch (error) {
      ctx.logger.error(error);
      ctx.body = '请重试或联系管理员';
    }
  }

  public async getJSConfig() {
    const { ctx } = this;

    const params = {
      debug: ctx.query.debug || false,
      jsApiList: (ctx.query.jsApiList || '').split(',') || [],
      url: decodeURIComponent(ctx.query.url) || ''
    };

    ctx.body = await ctx.service.wechat.util.getJsConfig(params);
  }
}
