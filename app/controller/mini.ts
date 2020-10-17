import { Controller } from 'egg';
import * as uuid from 'uuid';

export default class extends Controller {
  public async login() {
    const { ctx } = this;

    const result = await ctx.service.mini.util.login();

    // 生成 token 用于后续交互的认证
    const token = uuid.v4();
    const { openid } = result;
    await ctx.service.utils.cache.set(
      `wechat_mini_${token}`,
      JSON.stringify(result)
    );

    ctx.body = { token, openid };
  }

  public async decode() {
    const { ctx } = this;
    const { token, encryptedData, iv } = ctx.request.body;
    const config = ctx.mySession.config;

    try {
      const session = await ctx.service.utils.cache.get(`wechat_mini_${token}`);
      if (session) {
        const sessionJSON = JSON.parse(session);
        ctx.body = await ctx.service.mini.crypt.decode({
          appId: config.appId,
          sessionKey: sessionJSON.session_key,
          encryptedData,
          iv
        });
      }
    } catch (error) {
      ctx.body = {
        result: 'failed'
      };
    }
  }

  public async transfer() {
    const { ctx } = this;

    const result = await ctx.service.mini.util.transfer();

    ctx.body = result;
  }
}
