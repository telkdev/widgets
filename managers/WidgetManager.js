import { WidgetFactory } from './WidgetFactory.js';
import { StateManager } from './StateManager.js';
import { TreeManager } from './TreeManager.js';
import { WidgetErrorsManager } from './WidgetErrorsManager.js';
import { destroyWidget, doneWidget, failWidget, initWidget } from './WidgetManagersActions.js';

export class WidgetManager {
  constructor(options = {}, dependencies = {}) {
    this.factory =
      dependencies.factory ||
      WidgetFactory.create({
        resolver: options.resolver,
        widgetStore: dependencies.widgetStore,
        widgetDependencies: dependencies.widgetDependencies
      });
    this.state = dependencies.state || new StateManager();
    this.tree = dependencies.tree || new TreeManager();
    this.waitingParents = new Map();

    this.handleWidgetDestroy = this.handleWidgetDestroy.bind(this);
    this.handleWidgetDone = this.handleWidgetDone.bind(this);
  }

  static create(options = {}, dependencies = {}) {
    return new WidgetManager(options, dependencies);
  }

  async init(rootNode, callback) {
    return initWidget(this, rootNode, callback);
  }

  registerWaitingParent(childWidget, parentWidget) {
    if (!this.waitingParents.has(childWidget)) {
      this.waitingParents.set(childWidget, new Set());
    }
    this.waitingParents.get(childWidget).add(parentWidget);
  }

  prepareSubtreeForInit(rootNode, rootWidget) {
    if (!this.state.isDoneState(rootWidget)) {
      this.state.resetWidget(rootWidget);
    }

    this.unmarkSubtreeDestroyed(rootNode);
    const childNodes = this.tree.findNextLevelWidgets(rootNode);

    for (const childNode of childNodes) {
      const childWidget = this.factory.getWidget(childNode);
      if (childWidget && this.state.isDestroyed(childWidget)) {
        this.state.resetWidget(childWidget);
      }
    }
  }

  unmarkSubtreeDestroyed(rootNode) {
    const allNodes = this.tree.walkTree(rootNode);

    for (const node of allNodes) {
      const widget = this.factory.getWidget(node);
      if (widget) {
        this.state.unmarkDestroyed(widget);
      }
    }
  }

  setupEventListeners(widget) {
    widget.events.on('destroy', this.handleWidgetDestroy);
    widget.events.on('done', this.handleWidgetDone);
  }

  destroyEventListeners(widget) {
    widget.events.off('destroy', this.handleWidgetDestroy);
    widget.events.off('done', this.handleWidgetDone);
  }

  handleWidgetDestroy(widget) {
    this.state.markDestroyed(widget);
    this.checkParentInitializations(widget);
    this.destroyEventListeners(widget);
  }

  checkParentInitializations(widget) {
    for (const [rootWidget] of this.state.activeInits.entries()) {
      if (rootWidget !== widget && rootWidget.node.contains(widget.node)) {
        this.checkAllDone(rootWidget);
      }
    }
  }

  async handleWidgetDone(widget) {
    if (this.state.isFailState(widget) || this.state.isDestroyed(widget)) {
      this.checkAllDone(widget);
      return;
    }

    const initializingChildren = this.getInitializingChildren(widget.node);
    if (initializingChildren.length > 0) {
      for (const childNode of initializingChildren) {
        const childWidget = this.factory.getWidget(childNode);
        if (childWidget) {
          this.registerWaitingParent(childWidget, widget);
        }
      }
    }

    if (!this.state.isDestroyed(widget)) {
      await this.initChildWidgets(widget);
    }

    this.checkSubtreeCompletion(widget);
    this.checkWaitingParents(widget);
  }

  checkWaitingParents(widget) {
    if (!this.waitingParents.has(widget)) return;

    const waitingParents = this.waitingParents.get(widget);
    this.waitingParents.delete(widget);

    for (const parentWidget of waitingParents) {
      if (
        !this.state.isDoneState(parentWidget) ||
        this.state.isDestroyed(parentWidget)
      )
        continue;

      const stillInitializingChildren = this.getInitializingChildren(
        parentWidget.node
      );

      if (stillInitializingChildren.length === 0) {
        this.checkSubtreeCompletion(parentWidget);
      }
    }
  }

  checkSubtreeCompletion(widget) {
    if (this.state.hasCallback(widget)) {
      this.checkAllDone(widget);
    } else {
      for (const [rootWidget] of this.state.activeInits.entries()) {
        if (rootWidget.node.contains(widget.node)) {
          this.checkAllDone(rootWidget);
        }
      }
    }
  }

  async initChildWidgets(widget) {
    const childNodes = this.tree.findNextLevelWidgets(widget.node);
    const initPromises = [];

    for (const childNode of childNodes) {
      const childWidget = await this.factory.createWidget(childNode);

      if (childWidget && !this.state.isDestroyed(childWidget)) {
        if (
          this.state.isDoneState(childWidget) ||
          this.state.isFailState(childWidget)
        ) {
          continue;
        }

        if (!this.state.isInitedState(childWidget)) {
          this.setupEventListeners(childWidget);
        }

        initPromises.push(childWidget.init(() => childWidget.done()));
      }
    }

    await Promise.all(initPromises);
  }

  isParentInFailOrDestroy(node) {
    const parentNode = node.closest('[widget]:not(:scope)');
    if (!parentNode) return false;
    const parentWidget = this.factory.getWidget(parentNode);
    return (
      parentWidget &&
      (this.state.isFailState(parentWidget) ||
        this.state.isDestroyedState(parentWidget))
    );
  }

  checkAllDone(rootWidget) {
    const all = this.tree.walkTree(rootWidget.node);
    const errorsManager = new WidgetErrorsManager();

    const rootWidgetCompletedWithErrors =
      this.state.isFailState(rootWidget) ||
      this.state.isDestroyedState(rootWidget);

    if (rootWidgetCompletedWithErrors) {
      if (this.state.isFailState(rootWidget)) {
        errorsManager.makeWidgetFailedError(rootWidget.id);
      } else if (this.state.isDestroyedState(rootWidget)) {
        errorsManager.makeWidgetDestroyedError(rootWidget.id);
      }
    }

    const allDone =
      rootWidgetCompletedWithErrors ||
      all.every((node) => {
        const w = this.factory.getWidget(node);
        if (w && this.state.isInitedState(w)) return false;

        if (rootWidget.node !== node && this.isParentInFailOrDestroy(node)) {
          return true;
        }

        if (!w) return false;

        if (this.state.isFailState(w)) {
          errorsManager.makeWidgetFailedError(w.id);
          return true;
        }

        if (this.state.isDestroyedState(w)) {
          errorsManager.makeWidgetDestroyedError(w.id);
          return true;
        }

        return this.state.isDoneState(w);
      });

    if (!allDone) return;

    const callback = this.state.getCallback(rootWidget);
    if (callback) {
      console.log(
        'All widgets done for:',
        rootWidget.id,
        errorsManager.hasErrors ? 'WITH ERRORS' : ''
      );
      const errors = errorsManager.getErrors();

      if (errors.length) console.error('Errors for widget:', errors);

      callback(errors);
      this.state.unregisterCallback(rootWidget);
    }
  }

  getInitializingChildren(parentNode) {
    const childNodes = this.tree.findNextLevelWidgets(parentNode);

    return childNodes.filter((node) => {
      const widget = this.factory.getWidget(node);
      return widget && this.state.isInitedState(widget);
    });
  }

  destroy(domNode) {
    return destroyWidget(this, domNode);
  }

  done(domNode) {
    return doneWidget(this, domNode);
  }

  fail(domNode) {
    return failWidget(this, domNode);
  }
}
