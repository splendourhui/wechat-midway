import { Application } from 'egg';
import appendConfig from './middleware/append_config';

export default (app: Application) => {
  const { controller, router } = app;

  router.get('/', controller.home.index);

  router.all('/:type/:id/callback', appendConfig(), controller.wechat.callback);
  router.get('/:type/:id/oauth', appendConfig(), controller.wechat.oauth);
  router.get(
    '/:type/:id/oauth_init',
    appendConfig(),
    controller.wechat.oauthInit
  );
  router.get(
    '/:type/:id/oauth_get_user',
    appendConfig(),
    controller.wechat.oauthGetUser
  );
  router.get(
    '/:type/:id/js_config',
    appendConfig(),
    controller.wechat.getJSConfig
  );

  router.post('/mini/:id/login', appendConfig(), controller.mini.login);
  router.post('/mini/:id/decode', appendConfig(), controller.mini.decode);

  router.get('/mini/:id/proxy/*', appendConfig(), controller.mini.transfer);
  router.post('/mini/:id/proxy/*', appendConfig(), controller.mini.transfer);
  router.put('/mini/:id/proxy/*', appendConfig(), controller.mini.transfer);
  router.patch('/mini/:id/proxy/*', appendConfig(), controller.mini.transfer);
  router.delete('/mini/:id/proxy/*', appendConfig(), controller.mini.transfer);
};
