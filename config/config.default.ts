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
      appId: 'wx36f20fc356c772e0',
      secret: '1889bfef0ab148975b474a03d7591948',
      token: '928797_l',
      encodingAESKey: 'UtwKgZGTobw80o50OOlNhM2LObEyzPCG3pAlaRIi2UE'
    }
  };

  return {
    ...config,
    ...bizConfig
  };
};
