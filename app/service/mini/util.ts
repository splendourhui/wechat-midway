import { Service } from 'egg';

export default class extends Service {
  public async login() {
    const { ctx } = this;
    const { id } = ctx.params;
    const { code } = ctx.request.body;
    const config = ctx.mySession.config;

    const result = await ctx.app.curl(
      'https://api.weixin.qq.com/sns/jscode2session',
      {
        dataType: 'json',
        data: {
          appid: id,
          secret: config.secret,
          js_code: code,
          grant_type: 'authorization_code'
        }
      }
    );

    return result.data;
  }

  public async transfer() {
    const { ctx } = this;
    const token = ctx.header.token;
    const session = await ctx.service.utils.cache.get(`wechat_mini_${token}`);

    if (session) {
      // 获取转发的目标地址
      const target = ctx.url.split('/proxy')[1].split('?')[0];
      // 解析出目标 host，代表不同的服务代号
      const hostKey = target.split('/').filter(x => !!x)[0];
      const host = ctx.app.config.services[hostKey];
      // 解析出目标 path，代表不同的请求路径
      const path = target
        .split('/')
        .filter(x => !!x)
        .slice(1)
        .join('/');

      const message = `
Wechat Mini transfer to service：
host: ${host},
path: ${path}
method: ${ctx.request.method}
query: ${JSON.stringify(ctx.query || {})}
body: ${JSON.stringify(ctx.request.body || {})}`;
      ctx.logger.info(message);

      const result = await ctx.app.curl(`${host}/${path}`, {
        // 根据后端业务校验方式来修改，这里以直接传输 openid 为例
        headers: {
          sessionKey: JSON.parse(session).session_key,
          openId: JSON.parse(session).openid
        },
        method: ctx.request.method as any,
        dataType: 'json',
        data: ctx.request.body || ctx.query
      });

      return result.data;
    }
  }
}
