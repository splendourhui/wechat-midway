import * as crypto from 'crypto';

import { Service } from 'egg';

export default class extends Service {
  public async decode({ appId, sessionKey, encryptedData, iv }) {
    // base64 decode
    const sessionKeyDecode = new Buffer(sessionKey, 'base64');
    const encryptedDataDecode = new Buffer(encryptedData, 'base64');
    const ivDecode = new Buffer(iv, 'base64');

    let decoded;
    try {
      // 解密
      const decipher = crypto.createDecipheriv(
        'aes-128-cbc',
        sessionKeyDecode,
        ivDecode
      );
      // 设置自动 padding 为 true，删除填充补位
      decipher.setAutoPadding(true);
      decoded = decipher.update(encryptedDataDecode, 'binary', 'utf8');
      decoded += decipher.final('utf8');

      decoded = JSON.parse(decoded);
    } catch (err) {
      this.ctx.logger.error(err);
      throw new Error('Illegal Buffer');
    }

    if (decoded.watermark.appid !== appId) {
      throw new Error('Illegal Buffer');
    }

    return decoded;
  }
}
