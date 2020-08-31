import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>;

  config.keys = appInfo.name + '_1598514172918_8717';

  config.middleware = ['accessLog', 'mySession'];

  // 关闭 CSRF 校验，微信回调需要
  config.security = {
    csrf: {
      enable: false
    }
  };

  const bizConfig = {
    wechat: {
      appId: 'xxx',
      secret: 'xxx',
      token: 'xxx',
      encodingAESKey: 'xxx'
    }
  };

  return {
    ...config,
    ...bizConfig
  };
};
