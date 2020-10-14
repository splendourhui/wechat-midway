import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;

  router.get('/', controller.home.index);

  router.all('/wechat/callback', controller.wechat.callback);
  router.get('/wechat/oauth', controller.wechat.oauth);
  router.get('/wechat/oauth_init', controller.wechat.oauthInit);
  router.get('/wechat/oauth_get_user', controller.wechat.oauthGetUser);
  router.get('/wechat/js_config', controller.wechat.getJSConfig);
};
