import { Service } from 'egg';
import * as xml2js from 'xml2js';
import * as ejs from 'ejs';
import { IMessage } from '../../interface/message';

export default class extends Service {
  // 微信回调校验
  public async callbackVerify(): Promise<{ message: string } | void> {
    const { ctx } = this;
    const {
      signature,
      cryptor,
      timestamp,
      nonce,
      echostr
    } = await ctx.service.enterprise.util.getParams();

    if (signature !== cryptor.getSignature(timestamp, nonce, echostr)) {
      ctx.body = '';
    }
    return cryptor.decrypt(echostr);
  }

  // 将 xml 转化后的格式变成 json 格式
  private formatMessage(result) {
    let message = {};
    if (typeof result === 'object') {
      for (const key in result) {
        if (result[key].length === 1) {
          const val = result[key][0];
          if (typeof val === 'object') {
            message[key] = this.formatMessage(val);
          } else {
            message[key] = (val || '').trim();
          }
        } else {
          message = result[key].map(this.formatMessage);
        }
      }
    }
    return message;
  }

  // 微信属性格式转换为驼峰式
  private mapMsg(msg: any): IMessage {
    return {
      createdTime: msg.CreateTime,
      msgType: msg.MsgType,
      content: msg.Content,
      mediaId: msg.MediaId,
      recognition: msg.Recognition,
      userId: msg.FromUserName
    };
  }

  // 将 xml 消息解析为 json 格式
  public async decodeMsg(): Promise<IMessage> {
    const { ctx } = this;
    const {
      signature,
      cryptor,
      timestamp,
      nonce
    } = await ctx.service.enterprise.util.getParams();

    return new Promise((resolve, reject) => {
      let data = '';
      ctx.req.setEncoding('utf8');
      ctx.req.on('data', chunk => {
        data += chunk;
      });
      ctx.req.on('error', err => {
        reject(err);
      });
      ctx.req.on('end', () => {
        xml2js.parseString(data, { trim: true }, (err, result) => {
          if (err) {
            reject(new Error('xml 解析失败'));
          }
          const xml: any = this.formatMessage(result.xml);
          const encryptMessage = xml.Encrypt;
          if (
            signature !== cryptor.getSignature(timestamp, nonce, encryptMessage)
          ) {
            reject(new Error('signature 校验失败'));
          }
          const decrypted = cryptor.decrypt(encryptMessage);
          const messageWrapXml = decrypted.message;
          if (messageWrapXml === '') {
            reject(new Error('xml 解析失败'));
          }
          ctx.mySession.xml = messageWrapXml;

          xml2js.parseString(messageWrapXml, { trim: true }, (err, result) => {
            if (err) {
              reject(new Error('xml 解析失败'));
            }
            const message: any = this.formatMessage(result.xml);
            ctx.mySession.message = message;
            resolve(this.mapMsg(message));
          });
        });
      });
    });
  }

  // 获取原始回复 xml
  private compileReply(info) {
    return ejs.compile(
      [
        '<xml>',
        '<ToUserName><![CDATA[<%-toUsername%>]]></ToUserName>',
        '<FromUserName><![CDATA[<%-fromUsername%>]]></FromUserName>',
        '<CreateTime><%=createTime%></CreateTime>',
        '<MsgType><![CDATA[<%=msgType%>]]></MsgType>',
        '<% if (msgType === "news") { %>',
        '<ArticleCount><%=content.length%></ArticleCount>',
        '<Articles>',
        '<% content.forEach(function(item){ %>',
        '<item>',
        '<Title><![CDATA[<%-item.title%>]]></Title>',
        '<Description><![CDATA[<%-item.description%>]]></Description>',
        '<PicUrl><![CDATA[<%-item.picUrl || item.picurl || item.pic %>]]></PicUrl>',
        '<Url><![CDATA[<%-item.url%>]]></Url>',
        '</item>',
        '<% }); %>',
        '</Articles>',
        '<% } else if (msgType === "music") { %>',
        '<Music>',
        '<Title><![CDATA[<%-content.title%>]]></Title>',
        '<Description><![CDATA[<%-content.description%>]]></Description>',
        '<MusicUrl><![CDATA[<%-content.musicUrl || content.url %>]]></MusicUrl>',
        '<HQMusicUrl><![CDATA[<%-content.hqMusicUrl || content.hqUrl %>]]></HQMusicUrl>',
        '</Music>',
        '<% } else if (msgType === "voice") { %>',
        '<Voice>',
        '<MediaId><![CDATA[<%-content.mediaId%>]]></MediaId>',
        '</Voice>',
        '<% } else if (msgType === "image") { %>',
        '<Image>',
        '<MediaId><![CDATA[<%-content.mediaId%>]]></MediaId>',
        '</Image>',
        '<% } else if (msgType === "video") { %>',
        '<Video>',
        '<MediaId><![CDATA[<%-content.mediaId%>]]></MediaId>',
        '<Title><![CDATA[<%-content.title%>]]></Title>',
        '<Description><![CDATA[<%-content.description%>]]></Description>',
        '</Video>',
        '<% } else { %>',
        '<Content><![CDATA[<%-content%>]]></Content>',
        '<% } %>',
        '</xml>'
      ].join('')
    )(info);
  }

  // 获取加密 xml
  private compileWrap(wrap) {
    return ejs.compile(
      [
        '<xml>',
        '<Encrypt><![CDATA[<%-encrypt%>]]></Encrypt>',
        '<MsgSignature><![CDATA[<%-signature%>]]></MsgSignature>',
        '<TimeStamp><%-timestamp%></TimeStamp>',
        '<Nonce><![CDATA[<%-nonce%>]]></Nonce>',
        '</xml>'
      ].join('')
    )(wrap);
  }

  // 将回复内容转换为微信需要的 xml 格式
  private getReplyXml(content, fromUsername, toUsername) {
    const info: any = {};
    let type = 'text';
    info.content = content || '';
    if (typeof content === 'object') {
      if (content.hasOwnProperty('type')) {
        type = content.type;
        info.content = content.content;
      }
    }
    // if (Array.isArray(content)) {
    //   type = 'news';
    // } else if (typeof content === 'object') {
    //   if (content.hasOwnProperty('type')) {
    //     type = content.type;
    //     info.content = content.content;
    //   } else {
    //     type = 'music';
    //   }
    // }
    info.msgType = type;
    info.createTime = new Date().getTime();
    info.toUsername = toUsername;
    info.fromUsername = fromUsername;
    return this.compileReply(info);
  }

  // 将 json 或者 string 格式的内容转换为微信需要的 xml 格式
  public async encodeMsg(content) {
    const { ctx } = this;

    if (!content) {
      return '';
    }

    const { message } = ctx.mySession;

    const xml = this.getReplyXml(
      content,
      message.ToUserName,
      message.FromUserName
    );
    const { cryptor } = await ctx.service.enterprise.util.getParams();
    const wrap: any = {};
    wrap.encrypt = cryptor.encrypt(xml);
    wrap.nonce = parseInt((Math.random() * 100000000000) as any, 10);
    wrap.timestamp = new Date().getTime();
    wrap.signature = cryptor.getSignature(
      wrap.timestamp,
      wrap.nonce,
      wrap.encrypt
    );
    return this.compileWrap(wrap);
  }
}
