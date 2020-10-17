import { Service } from 'egg';
import * as formstream from 'formstream';

export default class extends Service {
  public async getMedia(mediaId) {
    const { ctx } = this;
    const { token } = await ctx.service.enterprise.util.getParams();
    const result = await ctx.app.curl(
      `https://qyapi.weixin.qq.com/cgi-bin/media/get?access_token=${token}&media_id=${mediaId}`,
      {
        timeout: 30000
      }
    );
    return result;
  }

  /**
   * 上传媒体文件
   * @param type 媒体类型，参考微信官方文档
   * @param buffer 媒体文件流
   * @param filename 文件名
   * @param contentType content-type
   */
  public async uploadMedia(type, buffer, filename, contentType) {
    const { ctx } = this;
    const { token } = await ctx.service.enterprise.util.getParams();
    const form = formstream();
    form.buffer('media', buffer, filename, contentType);
    const result = await ctx.app.curl(
      `https://qyapi.weixin.qq.com/cgi-bin/media/upload?access_token=${token}&type=${type}`,
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
