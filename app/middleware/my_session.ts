export default () => {
  return async (ctx, next) => {
    if (!ctx.mySession) {
      ctx.mySession = {};
    }
    await next();
  };
};
