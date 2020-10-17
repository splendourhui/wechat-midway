import { Service } from 'egg';
import * as crypto from 'crypto';
import * as WXBizMsgCrypt from 'wechat-crypto';

export default class extends Service {
  public async getParams() {
    const { ctx } = this;
    const { echostr, msg_signature: signature, timestamp, nonce } = ctx.query;
    const agentCfg = ctx.mySession.config;
    const cacheKey = `wechat_token_${agentCfg.corpId}_${agentCfg.agentId}`;

    const cryptor = new WXBizMsgCrypt(
      agentCfg.token,
      agentCfg.encodingAESKey,
      agentCfg.corpId
    );

    let token = await ctx.service.utils.cache.get(cacheKey);
    if (!token) {
      const result = await ctx.app.curl(
        `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${agentCfg.corpId}&corpsecret=${agentCfg.secret}`,
        {
          dataType: 'json'
        }
      );
      if (result.data.errcode !== 0) {
        throw new Error('get qy access_token error');
      }
      token = result.data.access_token;
      if (!token) {
        throw new Error('get qy access_token error');
      }
      await ctx.service.utils.cache.set(cacheKey, token, 60 * 60);
    }
    return {
      echostr,
      signature,
      timestamp,
      nonce,
      cryptor,
      agentCfg,
      token
    };
  }

  public async getAuthorizeURL(
    redirectURI: string,
    state: string,
    scope: string
  ) {
    const { ctx } = this;
    const config = ctx.mySession.config;

    return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${
      config.corpId
    }&redirect_uri=${encodeURIComponent(
      redirectURI
    )}&response_type=code&scope=${scope}&state=${state}`;
  }

  public async getUserToken(code: string) {
    const { ctx } = this;
    const { token } = await this.getParams();

    const result = await ctx.app.curl(
      `https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token=${token}&code=${code}`,
      {
        dataType: 'json'
      }
    );
    return result.data;
  }

  public async getUserInfo(
    openId: string,
    accessToken: string,
    lang = 'zh_CN'
  ) {
    const { ctx } = this;

    const result = await ctx.app.curl(
      `https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openId}&lang=${lang}`,
      {
        dataType: 'json'
      }
    );
    return result.data;
  }

  public async getTicket() {
    const { ctx } = this;
    const config = ctx.mySession.config;
    const cacheKey = `wechat_ticket_${config.corpId}_${config.agentId}`;
    let ticket = await ctx.service.utils.cache.get(cacheKey);
    if (!ticket) {
      const { token } = await this.getParams();
      const result = await ctx.app.curl(
        `https://qyapi.weixin.qq.com/cgi-bin/get_jsapi_ticket?access_token=${token}`,
        {
          dataType: 'json'
        }
      );
      if (result.data.errcode) {
        throw new Error('get enterprise ticket error');
      }
      ticket = result.data.ticket;
      if (!ticket) {
        throw new Error('get enterprise ticket error');
      }
      await ctx.service.utils.cache.set(cacheKey, ticket, 60 * 60);
    }
    return { ticket };
  }

  // 排序查询字符串
  private raw(args) {
    let keys = Object.keys(args);
    keys = keys.sort();
    const newArgs = {};
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      newArgs[key.toLowerCase()] = args[key];
    }

    let string = '';
    const newKeys = Object.keys(newArgs);
    for (let i = 0; i < newKeys.length; i++) {
      const k = newKeys[i];
      string += '&' + k + '=' + newArgs[k];
    }
    return string.substr(1);
  }

  // 签名算法
  private sign(nonceStr, jsapi_ticket, timestamp, url) {
    const ret = {
      jsapi_ticket,
      nonceStr,
      timestamp,
      url
    };
    const string = this.raw(ret);
    const shasum = crypto.createHash('sha1');
    shasum.update(string);
    return shasum.digest('hex');
  }

  public async getJsConfig(params) {
    const { ctx } = this;
    const config = ctx.mySession.config;

    const ticket = await this.getTicket();
    const nonceStr = Math.random().toString(36).substr(2, 15);
    const jsAPITicket = ticket.ticket;
    const timestamp = '' + Math.floor(Date.now() / 1000);
    const signature = this.sign(nonceStr, jsAPITicket, timestamp, params.url);

    return {
      debug: params.debug,
      appId: config.corpId,
      timestamp,
      nonceStr,
      signature,
      jsApiList: params.jsApiList
    };
  }
}
