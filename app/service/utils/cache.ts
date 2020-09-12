import { Service } from 'egg';

// 缓存数据，若项目中无 redis，则修改方法，使用内存或数据库实现
export default class extends Service {
  public async get(key: string) {
    const { ctx } = this;
    return await ctx.app.redis.get(key);
  }

  public async set(key: string, value: string, expires = 60 * 60) {
    const { ctx } = this;
    await ctx.app.redis.set(key, value);
    await ctx.app.redis.expire(key, expires);
  }

  public async expire(key: string, expires = 60 * 60) {
    const { ctx } = this;
    await ctx.app.redis.expire(key, expires);
  }

  public async delete(key: string) {
    const { ctx } = this;
    await ctx.app.redis.del(key);
  }
}
