

export async function initWidget(widgetManager, rootNode, callback) {
  if (!rootNode) return;

  if (widgetManager.tree.isRegularNode(rootNode)) {
    const topLevelWidgets = widgetManager.tree.findTopLevelWidgets(rootNode);

    if (topLevelWidgets.length === 0) {
      if (callback) callback([]);
      return;
    }

    const allErrors = [];

    for (const widgetNode of topLevelWidgets) {
      const handleComplete = (errors) => {
        if (callback) callback([...errors]);
        if (errors?.length > 0) allErrors.push(...errors);
      };

      initWidget(widgetManager, widgetNode, handleComplete);
    }
    return;
  }

  let rootWidget = widgetManager.factory.getWidget(rootNode);
  if (!rootWidget) {
    rootWidget = await widgetManager.factory.createWidget(rootNode);
    if (!rootWidget) return;
  }

  if (widgetManager.state.isInitedState(rootWidget)) {
    return;
  }

  widgetManager.prepareSubtreeForInit(rootNode, rootWidget);
  widgetManager.state.registerCallback(rootWidget, callback);
  widgetManager.setupEventListeners(rootWidget);

  if (widgetManager.state.isDoneState(rootWidget)) {
    await widgetManager.initChildWidgets(rootWidget);
    return;
  }

  if (widgetManager.state.isFailState(rootWidget)) {
    if (callback) callback([]);
    return;
  }

  await rootWidget.init(() => {
    rootWidget.done();
  });
} 

export function doneWidget(widgetManager, domNode) {
  const widget = widgetManager.factory.getWidget(domNode);
  if (widget && !widgetManager.state.isFailState(widget)) widget.done();
}

export function destroyWidget(widgetManager, domNode) {
  const allNodes = widgetManager.tree.walkTree(domNode);
  [...allNodes].reverse().forEach((node) => {
    const widget = widgetManager.factory.getWidget(node);
    if (!widget) return;
    widget.destroy();
    widgetManager.state.resetWidget(widget);
  });
  const domNodeWidget = widgetManager.factory.getWidget(domNode);
  for (const [rootWidget] of widgetManager.state.activeInits.entries()) {
    if (rootWidget.node.contains(domNode) || !domNodeWidget) {
      widgetManager.checkAllDone(rootWidget);
    }
  }
}

export function failWidget(widgetManager, domNode) {
  const widget = widgetManager.factory.getWidget(domNode);
  const isWidgetDestroyed = widget && widgetManager.state.isDestroyed(widget);
  const isWidgetNodeWithoutWidget = !widgetManager.tree.isRegularNode(domNode) && !widget;
  if (isWidgetDestroyed || isWidgetNodeWithoutWidget) return;

  if (widget) {
    widget.fail();
    if (widgetManager.state.hasCallback(widget)) return;
    for (const [rootWidget] of widgetManager.state.activeInits.entries()) {
      if (rootWidget !== widget && rootWidget.node.contains(widget.node)) {
        widgetManager.checkAllDone(rootWidget);
      }
    }
    return;
  }
  const allFirstChildNodes = widgetManager.tree.findTopLevelWidgets(domNode);
  for (const [rootWidget] of widgetManager.state.activeInits.entries()) {
    if (allFirstChildNodes.includes(rootWidget.node)) {
      rootWidget.fail();
    }
  }
}