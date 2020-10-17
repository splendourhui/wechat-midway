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
    mp: {
      appId: 'mp',
      secret: 'xxx',
      token: 'xxx',
      encodingAESKey: 'xxx'
    },
    corp_1000006: {
      corpId: 'corp',
      agentId: '1000006',
      secret: 'xxx',
      token: 'xxx',
      encodingAESKey: 'xxx'
    },
    mini: {
      appId: 'mini',
      secret: 'xxx'
    }
  };

  config.redis = {
    client: {
      port: 6379,
      host: 'yourRedisHost',
      password: 'yourRedisPassword',
      db: 0
    }
  };

  config.host = 'https://xxx.com';

  config.services = {
    serviceA: 'https://serviceA.com',
    serviceB: 'https://serviceB.com'
  };

  return config;
};
