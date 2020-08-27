import * as uuid from 'uuid';

const ignoreUrls = ['/', '/robots.txt'];

export default () => {
  return async (ctx, next) => {
    if (ignoreUrls.indexOf(ctx.url) !== -1) {
      await next();
      return;
    }

    const start = new Date().getTime();
    const ip = ctx.get('X-Real-IP') || ctx.ip;
    const traceId = ctx.get('X-Trace-Id') || uuid.v4();
    ctx.traceId = traceId;
    // egg 日志打印会取
    ctx.tracer = {
      traceId
    };

    function log() {
      const rs = Math.ceil(new Date().getTime() - start);
      ctx.set('X-Response-Time', rs);

      const status = ctx.status;
      const ua = ctx.get('user-agent') || '-';

      const message = `
realIp: ${ip},
ua: ${ua},
query: ${JSON.stringify(ctx.query || {})}
body: ${JSON.stringify(ctx.request.body || {})}
responseTime: ${rs}ms
responseStatus: ${status}`;
      ctx.logger.info(message);
    }

    await next();
    log();
  };
};
