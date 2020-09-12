import { Service } from 'egg';
import * as formstream from 'formstream';

export default class extends Service {
  public async getMedia(mediaId) {
    const { ctx } = this;
    const { token } = await ctx.service.wechat.util.getAccessToken();
    const result = await ctx.app.curl(
      `https://api.weixin.qq.com/cgi-bin/media/get?access_token=${token}&media_id=${mediaId}`,
      {
        timeout: 30000
      }
    );
    return result;
  }

  public async uploadMedia(type, buffer, filename, contentType) {
    const { ctx } = this;
    const { token } = await ctx.service.wechat.util.getAccessToken();
    const form = formstream();
    form.buffer('media', buffer, filename, contentType);
    const result = await ctx.app.curl(
      `https://api.weixin.qq.com/cgi-bin/media/upload?access_token=${token}&type=${type}`,
      {
        method: 'POST',
        headers: form.headers(),
        stream: form,
        dataType: 'json',
        timeout: 30000
      }
    );
    return result;
  }
}
