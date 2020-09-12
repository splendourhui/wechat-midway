export interface IMessage {
  createdTime: string;
  userId: string;
  msgType?: 'text' | 'voice' | 'image' | 'video';
  title?: string;
  content?: string;
  // 语音识别结果
  recognition?: string;
  // 文本消息
  text?: string;
  // 文件消息
  fileName?: string;
  contentType?: string;
  // 媒体文件消息
  mediaId?: string;
  // 图文消息
  articles?: any[];
}
