import { BaseWidget } from '../BaseWidget.js';
import HtmlBuilder from '../utils/HtmlBuilder.js';

class HoverWidget extends BaseWidget {
  constructor(node) {
    super(node);
    this.hoverCount = 0;
    this.htmlBuilder = new HtmlBuilder(this.document);
  }
  
  async initContent() {    
    this.widgetContent = this.htmlBuilder.createDiv('widget-content');
    
    this.statusDiv = this.htmlBuilder.createDiv('widget-counter', 'Hover to activate');
    this.widgetContent.appendChild(this.statusDiv);
    
    this.resetButton = this.htmlBuilder.createButton('widget-button', 'Reset Count');
    this.resetButton.addEventListener('click', this.resetCountHandler);
    this.widgetContent.appendChild(this.resetButton);
    
    const htmlContent = this.htmlBuilder.createDiv('widget-html-content');
    this.widgetContent.appendChild(htmlContent);
    
    this.node.appendChild(this.widgetContent);
    
    this.node.addEventListener('mouseenter', this.mouseEnterHandler);
    this.node.addEventListener('mouseleave', this.mouseLeaveHandler);
  }
  
  mouseEnterHandler() {
    this.hoverCount++;
    this.statusDiv.textContent = `Hovered ${this.hoverCount} times`;
  }
  
  mouseLeaveHandler() {
    // No inline styles needed
  }
  
  resetCountHandler(e) {
    e.stopPropagation();
    this.hoverCount = 0;
    this.statusDiv.textContent = 'Hover count reset';
  }
  
  destroy() {
    this.cleanup();
    super.destroy();
  }
  
  cleanup() {
    this.node.removeEventListener('mouseenter', this.mouseEnterHandler);
    this.node.removeEventListener('mouseleave', this.mouseLeaveHandler);
    
    if (this.resetButton) {
      this.resetButton.removeEventListener('click', this.resetCountHandler);
    }
    
    if (this.widgetContent && this.widgetContent.parentNode) {
      this.widgetContent.parentNode.removeChild(this.widgetContent);
      this.widgetContent = null;
      this.statusDiv = null;
      this.resetButton = null;
    }
  }
}

export default HoverWidget;