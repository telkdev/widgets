import { WidgetManager } from './managers/WidgetManager.js';

export class X {
  constructor(options = {}, dependencies = {}) {
    this.manager = dependencies.manager || WidgetManager.create(options, dependencies);
  }

  static create(options = {}, dependencies = {}) {
    return new X(options, dependencies);
  }

  async init(rootNode, callback) {
    return this.manager.init(rootNode, callback);
  }

  destroy(domNode) {
    this.manager.destroy(domNode);
  }

  done(domNode) {
    this.manager.done(domNode);
  }

  fail(domNode) {
    this.manager.fail(domNode);
  }
}
