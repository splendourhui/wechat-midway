import { EggPlugin } from 'egg';

const plugin: EggPlugin = {
  // static: true,
  // nunjucks: {
  //   enable: true,
  //   package: 'egg-view-nunjucks',
  // },

  // 需要使用 redis，请在此打开
  redis: {
    enable: false,
    package: 'egg-redis'
  }
};

export default plugin;
