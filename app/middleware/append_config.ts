export default () => {
  return async (ctx, next) => {
    ctx.mySession.config = ctx.app.config.wechat[ctx.params.id];
    await next();
  };
};
