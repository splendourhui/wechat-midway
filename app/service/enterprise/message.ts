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
    if (message || isTyping) {
      return;
    }
    return;
  }

  // 调用企业微信应用消息 API
  public async sendMsg(data: any) {
    const { ctx } = this;
    const { token } = await ctx.service.enterprise.util.getParams();
    const result = await ctx.app.curl(
      `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${token}`,
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
  public async sendTextMsg(data: any) {
    const { agentCfg } = await this.service.enterprise.util.getParams();
    await this.sendMsg({
      wechatId: data.wechatId,
      touser: data.userId,
      msgtype: 'text',
      agentid: agentCfg?.agentId,
      text: {
        content: data.content
      }
    });
  }

  // 图片消息
  public async sendImageMsg(message: IMessage) {
    const { agentCfg } = await this.service.enterprise.util.getParams();
    await this.sendMsg({
      touser: message.userId,
      msgtype: 'image',
      agentid: agentCfg?.agentId,
      image: {
        media_id: message.mediaId
      }
    });
  }

  // 语音消息
  public async sendVoiceMsg(message: IMessage) {
    const { agentCfg } = await this.service.enterprise.util.getParams();
    await this.sendMsg({
      touser: message.userId,
      msgtype: 'voice',
      agentid: agentCfg?.agentId,
      voice: {
        media_id: message.mediaId
      }
    });
  }

  // 视频消息
  public async sendVideoMsg(message: IMessage) {
    const { agentCfg } = await this.service.enterprise.util.getParams();
    await this.sendMsg({
      touser: message.userId,
      msgtype: 'video',
      agentid: agentCfg?.agentId,
      video: {
        media_id: message.mediaId
      }
    });
  }

  // 图文消息
  public async sendNewsMsg(message: IMessage) {
    const { agentCfg } = await this.service.enterprise.util.getParams();
    await this.sendMsg({
      touser: message.userId,
      msgtype: 'news',
      agentid: agentCfg?.agentId,
      news: {
        articles: message.articles
      }
    });
  }

  // 文件消息
  public async sendFileMsg(data: any) {
    const { agentCfg } = await this.service.enterprise.util.getParams();
    await this.sendMsg({
      wechatId: data.wechatId,
      touser: data.userId,
      msgtype: 'file',
      agentid: agentCfg?.agentId,
      file: {
        media_id: data.mediaId
      }
    });
  }

  // Markdown 消息
  public async sendMDMsg(data: any) {
    const { agentCfg } = await this.service.enterprise.util.getParams();
    await this.sendMsg({
      wechatId: data.wechatId,
      touser: data.userId,
      msgtype: 'markdown',
      agentid: agentCfg?.agentId,
      markdown: {
        content: data.content
      }
    });
  }
}
