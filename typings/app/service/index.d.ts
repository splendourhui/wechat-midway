// This file is created by egg-ts-helper@1.25.8
// Do not modify this file!!!!!!!!!

import 'egg';
type AnyClass = new (...args: any[]) => any;
type AnyFunc<T = any> = (...args: any[]) => T;
type CanExportFunc = AnyFunc<Promise<any>> | AnyFunc<IterableIterator<any>>;
type AutoInstanceType<T, U = T extends CanExportFunc ? T : T extends AnyFunc ? ReturnType<T> : T> = U extends AnyClass ? InstanceType<U> : U;
import ExportUtilsCache from '../../../app/service/utils/cache';
import ExportWechatAdapter from '../../../app/service/wechat/adapter';
import ExportWechatMedia from '../../../app/service/wechat/media';
import ExportWechatUtil from '../../../app/service/wechat/util';

declare module 'egg' {
  interface IService {
    utils: {
      cache: AutoInstanceType<typeof ExportUtilsCache>;
    }
    wechat: {
      adapter: AutoInstanceType<typeof ExportWechatAdapter>;
      media: AutoInstanceType<typeof ExportWechatMedia>;
      util: AutoInstanceType<typeof ExportWechatUtil>;
    }
  }
}
