// This file is created by egg-ts-helper@1.25.8
// Do not modify this file!!!!!!!!!

import 'egg';
type AnyClass = new (...args: any[]) => any;
type AnyFunc<T = any> = (...args: any[]) => T;
type CanExportFunc = AnyFunc<Promise<any>> | AnyFunc<IterableIterator<any>>;
type AutoInstanceType<T, U = T extends CanExportFunc ? T : T extends AnyFunc ? ReturnType<T> : T> = U extends AnyClass ? InstanceType<U> : U;
import ExportEnterpriseAdapter from '../../../app/service/enterprise/adapter';
import ExportEnterpriseMedia from '../../../app/service/enterprise/media';
import ExportEnterpriseMessage from '../../../app/service/enterprise/message';
import ExportEnterpriseUtil from '../../../app/service/enterprise/util';
import ExportMiniCrypt from '../../../app/service/mini/crypt';
import ExportMiniUtil from '../../../app/service/mini/util';
import ExportUtilsCache from '../../../app/service/utils/cache';
import ExportWechatAdapter from '../../../app/service/wechat/adapter';
import ExportWechatMedia from '../../../app/service/wechat/media';
import ExportWechatMessage from '../../../app/service/wechat/message';
import ExportWechatUtil from '../../../app/service/wechat/util';

declare module 'egg' {
  interface IService {
    enterprise: {
      adapter: AutoInstanceType<typeof ExportEnterpriseAdapter>;
      media: AutoInstanceType<typeof ExportEnterpriseMedia>;
      message: AutoInstanceType<typeof ExportEnterpriseMessage>;
      util: AutoInstanceType<typeof ExportEnterpriseUtil>;
    }
    mini: {
      crypt: AutoInstanceType<typeof ExportMiniCrypt>;
      util: AutoInstanceType<typeof ExportMiniUtil>;
    }
    utils: {
      cache: AutoInstanceType<typeof ExportUtilsCache>;
    }
    wechat: {
      adapter: AutoInstanceType<typeof ExportWechatAdapter>;
      media: AutoInstanceType<typeof ExportWechatMedia>;
      message: AutoInstanceType<typeof ExportWechatMessage>;
      util: AutoInstanceType<typeof ExportWechatUtil>;
    }
  }
}
