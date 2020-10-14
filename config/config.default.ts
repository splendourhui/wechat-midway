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

  config.wechat = {
    appId: 'xxx',
    secret: 'xxx',
    token: 'xxx',
    encodingAESKey: 'xxx'
  };

  config.redis = {
    client: {
      port: 6379,
      host: 'xxx',
      password: 'xxx',
      db: 0
    }
  };

  config.host = 'http://yourhost.com';

  return config;
};
