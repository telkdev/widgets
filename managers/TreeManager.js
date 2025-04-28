const WIDGET = 'widget';

export class TreeManager {
  walkTree(root) {
    return [root, ...root.querySelectorAll(`[${WIDGET}]`)];
  }

  isDirectDescendant(widgetNode, parentNode) {
    let current = widgetNode.parentElement;
    
    while (current && current !== parentNode) {
      if (current.hasAttribute(WIDGET)) {
        return false;
      }
      current = current.parentElement;
    }
    
    return true;
  }

  findNextLevelWidgets(widgetNode) {
    const allDescendantWidgets = Array.from(widgetNode.querySelectorAll(`[${WIDGET}]`));
    return allDescendantWidgets.filter(node => this.isDirectDescendant(node, widgetNode));
  }

  findTopLevelWidgets(node) {
    if (node.hasAttribute(WIDGET)) {
      return [node];
    }
    
    const allWidgets = Array.from(node.querySelectorAll(`[${WIDGET}]`));
    return allWidgets.filter(widgetNode => this.isDirectDescendant(widgetNode, node));
  }

  isRegularNode(node) {
    return !node.hasAttribute(WIDGET);
  }
}