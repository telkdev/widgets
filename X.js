import { WidgetManager } from './managers/WidgetManager.js';

export class X {
  /**
   * Create a new X instance with dependency injection
   * @param {Object} options - Configuration options
   * @param {Object} dependencies - Dependencies to inject
   * @param {Object} dependencies.widgetDependencies - Dependencies to pass to widgets
   */
  constructor(options = {}, dependencies = {}) {
    this.manager = dependencies.manager || WidgetManager.create(options, dependencies);
  }

  /**
   * Static factory method for easier instantiation with dependencies
   * @param {Object} options - Configuration options 
   * @param {Object} dependencies - Dependencies to inject
   * @returns {X} A new X instance
   */
  static create(options = {}, dependencies = {}) {
    return new X(options, dependencies);
  }

  /**
   * Initialize a widget and its subtree
   * Now handles both widget nodes and regular nodes with widget children
   */
  async init(rootNode, callback) {
    return this.manager.init(rootNode, callback);
  }

  /**
   * Destroy a widget and its subtree
   */
  destroy(domNode) {
    this.manager.destroy(domNode);
  }

  /**
   * Mark a widget as done
   */
  done(domNode) {
    this.manager.done(domNode);
  }

  /**
   * Mark a widget as failed
   */
  fail(domNode) {
    this.manager.fail(domNode);
  }
}
