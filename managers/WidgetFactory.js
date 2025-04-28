import { WidgetResolver } from '../WidgetResolver.js';

export class WidgetFactory {
  constructor(dependencies = {}) {
    this.resolver = dependencies.resolver || new WidgetResolver('./');
    this.widgets = dependencies.widgetStore || new Map(); // Map<Node, Widget>
    this.widgetDependencies = dependencies.widgetDependencies || {};
  }

  static create(dependencies = {}) {
    return new WidgetFactory(dependencies);
  }

  async createWidget(node) {
    const path = node.getAttribute('widget');
    if (!path) return null;

    if (this.widgets.has(node)) {
      return this.widgets.get(node);
    }

    try {
      const WidgetClass = await this.resolver.resolve(path);

      const widget = new WidgetClass(node, this.widgetDependencies);
      
      this.widgets.set(node, widget);

      return widget;
    } catch (error) {
      console.error(`Failed to create widget ${path}:`, error);
      return null;
    }
  }

  getWidget(node) {
    return this.widgets.get(node);
  }

  hasWidget(node) {
    return this.widgets.has(node);
  }
}