import { Controller } from 'egg';

export default class extends Controller {
  public async index() {
    const { ctx } = this;
    ctx.body = 'alive';
  }
}
