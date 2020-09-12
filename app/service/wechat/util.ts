import { Service } from 'egg';

export default class extends Service {
  public async getAccessToken() {
    const { ctx } = this;
    const config = ctx.app.config.wechat;
    const cacheKey = `wechat_token_${config.appId}`;
    let token = await ctx.service.utils.cache.get(cacheKey);
    if (!token) {
      const result = await ctx.app.curl(
        `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.appId}&secret=${config.secret}`,
        {
          dataType: 'json'
        }
      );
      if (result.data.errcode) {
        throw new Error('get mp access_token error');
      }
      token = result.data.access_token;
      if (!token) {
        throw new Error('get mp access_token error');
      }
      await ctx.service.utils.cache.set(cacheKey, token, 60 * 60);
    }
    return { token };
  }
}
