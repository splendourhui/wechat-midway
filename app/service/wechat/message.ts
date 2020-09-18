import { Service } from 'egg';
import { IMessage } from '../../interface/message';

export interface IMenuMsg {
  headContent?: string;
  tailContent?: string;
  list: { id: number; content: string }[];
}

export default class extends Service {
  // 客服输入状态
  public async typing(message: IMessage, isTyping = true) {
    const { ctx } = this;
    const { token } = await this.service.wechat.util.getAccessToken();
    const result = await ctx.app.curl(
      `https://api.weixin.qq.com/cgi-bin/message/custom/typing?access_token=${token}`,
      {
        method: 'POST',
        contentType: 'json',
        dataType: 'json',
        data: {
          touser: message.userId,
          command: isTyping ? 'Typing' : 'CancelTyping'
        }
      }
    );
    return result;
  }

  // 调用微信客服消息 API
  public async sendMsg(data: any) {
    const { ctx } = this;
    const { token } = await this.service.wechat.util.getAccessToken();
    const result = await ctx.app.curl(
      `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${token}`,
      {
        method: 'POST',
        contentType: 'json',
        dataType: 'json',
        data
      }
    );
    return result;
  }

  // 文本消息
  public async sendTextMsg(message: IMessage) {
    await this.sendMsg({
      touser: message.userId,
      msgtype: 'text',
      text: {
        content: message.content
      }
    });
  }

  // 图片消息
  public async sendImageMsg(message: IMessage) {
    await this.sendMsg({
      touser: message.userId,
      msgtype: 'image',
      image: {
        media_id: message.mediaId
      }
    });
  }

  // 语音消息
  public async sendVoiceMsg(message: IMessage) {
    await this.sendMsg({
      touser: message.userId,
      msgtype: 'voice',
      voice: {
        media_id: message.mediaId
      }
    });
  }

  // 视频消息
  public async sendVideoMsg(message: IMessage) {
    await this.sendMsg({
      touser: message.userId,
      msgtype: 'video',
      video: {
        media_id: message.mediaId
      }
    });
  }

  // 图文消息
  public async sendNewsMsg(message: IMessage) {
    await this.sendMsg({
      touser: message.userId,
      msgtype: 'news',
      news: {
        articles: message.articles
      }
    });
  }

  // 菜单消息
  public async sendMenuMsg(message: IMessage, data: IMenuMsg) {
    await this.sendMsg({
      touser: message.userId,
      msgtype: 'msgmenu',
      msgmenu: {
        head_content: data.headContent + '\n',
        list: data.list,
        tail_content: '\n' + data.tailContent
      }
    });
  }
}
